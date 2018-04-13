import {isDefined} from './util';



////////////////////////////////////////////////////////////////////////////////
// Iterating
////////////////////////////////////////////////////////////////////////////////

export function* forwardIndex(size: number): IterableIterator<number> {
  for (let index = 0; index < size; index++) { yield index; }
}

export function* backwardIndex(size: number): IterableIterator<number> {
  for (let index = size - 1; index >= 0; index--) { yield index; }
}

export function indexGenerator(size: number, reverse?: boolean): IterableIterator<number> {
  return (!reverse ? forwardIndex : backwardIndex)(size);
}

export interface SpecFilteredCollectionIterator<T> {
  collection: T[];
  reverse: boolean;
}

export type CollectionIteratorFilter<T, M = T> = (item: T, index: number, collection: T[]) => {exclude: boolean, value: M};

export function* filteredCollectionIterator<T, M = T>(
  {collection, reverse}: SpecFilteredCollectionIterator<T>,
  filter: CollectionIteratorFilter<T, M>
) {
  for (let index of indexGenerator(collection.length, reverse)) {
    const {exclude, value} = filter(collection[index], index, collection);
    if (!exclude) { yield value; }
  }
}

export function getFirst<T, M = T>(collection: T[], filter: CollectionIteratorFilter<T, M>): M {
  return filteredCollectionIterator<T, M>({collection, reverse: false}, filter).next().value;
}

export function getLast<T, M = T>(collection: T[], filter: CollectionIteratorFilter<T, M>): M {
  return filteredCollectionIterator<T, M>({collection, reverse: true}, filter).next().value;
}



////////////////////////////////////////////////////////////////////////////////
// Focusing
////////////////////////////////////////////////////////////////////////////////

export function getTabIndex(element: HTMLElement): number {
  const value = element.getAttribute('tabindex');
  return isDefined(value) ? parseInt(value, 10) : element.tabIndex;
}

export function getTabIndexForSorting(element: HTMLElement): number {
  const value = getTabIndex(element);
  return value === 0 ? Infinity : value;
}

export function isElementNotDisplayed(element: any, notDisplayedCache: Map<HTMLElement, boolean>): boolean {
  if (element === document.documentElement) { return false; }

  let notDisplayedState;
  if (notDisplayedCache.has(element)) {
    notDisplayedState = notDisplayedCache.get(element);
  } else {
    if (window.getComputedStyle(element).display === 'none') {
      notDisplayedState = true;
    } else {
      const parent = element.parentNode;
      if (isDefined(parent)) {
        notDisplayedState = isElementNotDisplayed(parent, notDisplayedCache);
      }
    }
    notDisplayedCache.set(element, notDisplayedState);
  }

  return notDisplayedState;
}

export function isElementHiddenOrDisabled(element: any, notDisplayedCache: Map<HTMLElement, boolean>): boolean {
  if (element.disabled) { return true; }
  if (element.tagName === 'input' && element.type === 'hidden') { return true; }
  if (isElementNotDisplayed(element, notDisplayedCache)) { return true; }
  if (window.getComputedStyle(element).visibility === 'hidden') { return true; }

  return false;
}

export interface TabbableWrapper {
  element: HTMLElement;
  index: number;
  tabIndex: number;
}

export interface SpecFilterTabbable {
  wrapper: TabbableWrapper;
  notDisplayedCache: Map<HTMLElement, boolean>;
};

function isActualTabbable({wrapper, notDisplayedCache}: SpecFilterTabbable) {
  const {element, tabIndex} = wrapper;

  if (tabIndex < 0) { return false; }
  if (tabIndex !== Infinity) { return false; }

  if (isElementHiddenOrDisabled(element, notDisplayedCache)) { return false; }

  return true;
}

function potentialTabbableFilter() {
  const notDisplayedCache = new Map();

  return (element, index) => ({
    value: element,
    exclude: !isActualTabbable({wrapper: {element, index, tabIndex: getTabIndexForSorting(element)}, notDisplayedCache}),
  });
}

export function getPotentialTabbable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll([
    'input', 'select', 'button',
    'a[href]', 'area[href]',
    'textarea',
    '[tabindex]'
  ].join(', ')));
}

export interface SpecFindFocusable {
  root: HTMLElement;
}

export interface SpecFindFirstFocusable extends SpecFindFocusable {
  reverse?: boolean;
}

export function findFirstFocusable(spec: SpecFindFirstFocusable): HTMLElement {
  const getter = spec.reverse ? getLast : getFirst;
  return getter<HTMLElement>(getPotentialTabbable(spec.root), potentialTabbableFilter());
}

export function focusFirst(spec: SpecFindFirstFocusable) {
  const element = findFirstFocusable(spec);
  if (isDefined(element)) { element.focus(); }
}

export function focusLast({root}: SpecFindFocusable) {
  return focusFirst({root, reverse: true});
}



////////////////////////////////////////////////////////////////////////////////
// aria-hidden
////////////////////////////////////////////////////////////////////////////////

export function hideOtherElements(element: HTMLElement) {
  const attribute = 'aria-hidden';

  const parent = element.parentElement;

  const hiddenElements = Array.from(parent.children)
    .filter(child => child !== element && !isDefined(child.getAttribute(attribute)));
  hiddenElements.forEach(hiddenElement => hiddenElement.setAttribute(attribute, 'true'));

  const revertParentSiblings = parent === document.body ? () => {} : hideOtherElements(parent);

  return () => {
    hiddenElements.forEach(hiddenElement => hiddenElement.removeAttribute(attribute));
    revertParentSiblings();
  };
}



////////////////////////////////////////////////////////////////////////////////
// Intercepting
////////////////////////////////////////////////////////////////////////////////

export function createFocusInterceptor({onIntercept, tabIndex}) {
  if (!isDefined(tabIndex)) { tabIndex = 0; }

  const element = document.createElement('div');

  const style = element.style;
  style.width = '0';
  style.height = '0';
  element.setAttribute('aria-hidden', 'true');

  element.tabIndex = tabIndex;
  style.position = 'fixed';
  element.addEventListener('focus', onIntercept);

  return element;
}

export interface SpecInterceptor {
  anchor: HTMLElement;
  position: InsertPosition;
  tabIndex?: number;
  setFocus: ({root: HTMLElement}) => any;
}

export function trapFocusInside(element: HTMLElement): () => any {
  const {body} = document;
  const interceptors = ([
    {anchor: body   , position: 'afterbegin' ,  setFocus: focusFirst },
    {anchor: element, position: 'beforebegin',  setFocus: focusLast  },
    {anchor: element, position: 'afterend'   ,  setFocus: focusFirst },
    {anchor: body   , position: 'beforeend'  ,  setFocus: focusLast  }
  ] as SpecInterceptor[]).map(({anchor, position, tabIndex, setFocus}) => {
    const interceptor = createFocusInterceptor({onIntercept: () => setFocus({root: element}), tabIndex});
    anchor.insertAdjacentElement(position, interceptor);
    return interceptor;
  });

  const revertHiddenElements = hideOtherElements(element);

  return () => {
    interceptors.forEach(interceptor => interceptor.remove());
    revertHiddenElements();
  };
}
