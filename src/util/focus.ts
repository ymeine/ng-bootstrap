import {isDefined} from './util';



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

export function getTabIndexForSorting(element: HTMLElement): number {
  const value = getTabIndex(element);
  return value === 0 ? Infinity : value;
}

export interface TabbableWrapper {
  element: HTMLElement;
  index: number;
  tabIndex: number;
}

export interface SpecFilterTabbable {
  wrapper: TabbableWrapper;
  excludeHighTabIndexes?: boolean;
  excludeNaturalTabIndexes?: boolean;
  notDisplayedCache: Map<HTMLElement, boolean>;
};

function filterPotentialTabbable({wrapper, notDisplayedCache}: SpecFilterTabbable) {
  const {element, tabIndex} = wrapper;

  if (tabIndex < 0) { return false; }
  if (tabIndex !== Infinity) { return false; }

  if (isElementHiddenOrDisabled(wrapper.element, notDisplayedCache)) { return false; }

  return true;
}

export interface SpecGetTabbable {
  root: HTMLElement;
};

export function getTabbable({root}: SpecGetTabbable): HTMLElement[] {
  const notDisplayedCache = new Map();
  return Array.from(root.querySelectorAll([
    'input', 'select', 'button',
    'a[href]', 'area[href]',
    'textarea',
    '[tabindex]'
  ].join(', ')))
  .map((element: HTMLElement, index: number): TabbableWrapper => { return {element, index, tabIndex: getTabIndexForSorting(element) }; })
  .filter(wrapper => filterPotentialTabbable({wrapper, notDisplayedCache}))
  .map(wrapper => wrapper.element);
}

export interface SpecFindFocusable {
  root: HTMLElement;
}

export interface SpecFindFirstFocusable extends SpecFindFocusable {
  reverse?: boolean;
}

export function findFirstFocusable(spec: SpecFindFirstFocusable): HTMLElement {
  const children = getTabbable(spec);
  return children[spec.reverse ? children.length - 1 : 0];
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
