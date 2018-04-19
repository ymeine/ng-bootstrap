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

function potentialTabbableFilter() {
  const notDisplayedCache = new Map();

  return element => ({
    value: element,
    exclude: getTabIndex(element) !== 0 || isElementHiddenOrDisabled(element, notDisplayedCache),
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

export function focusFirstFound(root: HTMLELement, reverse?: boolean) {
  const element = (reverse ? getLast : getFirst)<HTMLElement>(getPotentialTabbable(root), potentialTabbableFilter());
  if (isDefined(element)) { element.focus(); }
}

export function focusFirst(root: HTMLElement) { focusFirstFound(root);       }
export function focusLast(root: HTMLElement)  { focusFirstFound(root, true); }



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

export function createFocusInterceptor(onIntercept) {
  const element = document.createElement('div');

  const style = element.style;
  style.width = '0';
  style.height = '0';
  element.setAttribute('aria-hidden', 'true');

  style.position = 'fixed';
  element.addEventListener('focus', onIntercept);

  return element;
}

interface SpecInterceptor {
  anchor: HTMLElement;
  position: InsertPosition;
  setFocus: (root: HTMLElement) => any;
}

export function trapFocusInside(element: HTMLElement): () => any {
  const {body} = document;
  const interceptors = ([
    {anchor: body   , position: 'afterbegin' ,  setFocus: focusFirst },
    {anchor: element, position: 'beforebegin',  setFocus: focusLast  },
    {anchor: element, position: 'afterend'   ,  setFocus: focusFirst },
    {anchor: body   , position: 'beforeend'  ,  setFocus: focusLast  }
  ] as SpecInterceptor[]).map(({anchor, position, setFocus}) => {
    const interceptor = createFocusInterceptor(() => setFocus(element));
    anchor.insertAdjacentElement(position, interceptor);
    return interceptor;
  });

  const revertHiddenElements = hideOtherElements(element);

  return () => {
    interceptors.forEach(interceptor => interceptor.remove());
    revertHiddenElements();
  };
}
