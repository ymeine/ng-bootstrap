import {isDefined} from './util';



////////////////////////////////////////////////////////////////////////////////
// Focusing
////////////////////////////////////////////////////////////////////////////////

export function getTabIndex(element: HTMLElement): number {
  const value = element.getAttribute('tabindex');
  return isDefined(value) ? parseInt(value, 10) : element.tabIndex;
}

export function isElementHiddenOrDisabled(element: any): boolean {
  if (element.disabled) { return true; }
  if (element.tagName === 'input' && element.type === 'hidden') { return true; }
  // TODO Check visibility in whole branch

  return false;
}

export function getTabIndexForSorting(element: HTMLElement): number {
  const value = getTabIndex(element);
  return value === 0 ? Infinity : value;
}

function filterSortingTabIndex(tabIndex: number, excludeHighTabIndexes?: boolean, excludeNaturalTabIndexes?: boolean): boolean {
  if (!isDefined(excludeHighTabIndexes)) {
    excludeHighTabIndexes = false;
  }

  if (!isDefined(excludeNaturalTabIndexes)) {
    excludeNaturalTabIndexes = false;
  }

  if (tabIndex < 0) {
    return false;
  }

  if (excludeHighTabIndexes && tabIndex !== Infinity) {
    return false;
  }

  if (excludeNaturalTabIndexes && tabIndex == Infinity) {
    return false;
  }

  return true;
}

export function getTabbable(root: HTMLElement, excludeHighTabIndexes?: boolean, excludeNaturalTabIndexes?: boolean): HTMLElement[] {
  return Array.from(root.querySelectorAll([
    'input', 'select', 'button',
    'a[href]', 'area[href]',
    'textarea',
    '[tabindex]'
  ].join(', ')))
  .map((element: HTMLElement, index: number) => { return {
    element,
    index,
    tabIndex: getTabIndexForSorting(element)
  }; })
  .filter(wrapper => filterSortingTabIndex(wrapper.tabIndex, excludeHighTabIndexes, excludeNaturalTabIndexes))
  .filter(wrapper => !isElementHiddenOrDisabled(wrapper.element))
  .sort((a, b) => a.tabIndex === b.tabIndex ? a.index - b.index : a.tabIndex - b.tabIndex)
  .map(wrapper => wrapper.element);
}

export function findFirstFocusable(
  element: HTMLElement,
  reverse?: boolean,
  excludeHighTabIndexes?: boolean,
  excludeNaturalTabIndexes?: boolean
): HTMLElement {
  if (!isDefined(reverse)) { reverse = false; }

  const children = getTabbable(element, excludeHighTabIndexes, excludeNaturalTabIndexes);
  console.log('tabbable elements');
  console.log(children);
  const index = reverse ? children.length - 1 : 0;

  return children[index];
}

export function focusFirst(container: HTMLElement, reverse?: boolean, excludeHighTabIndexes?: boolean, excludeNaturalTabIndexes?: boolean) {
  if (!isDefined(reverse)) { reverse = false; }

  if (reverse) {
    console.log('focusing last');
  } else {
    console.log('focusing first');
  }
  console.log('active element');
  console.log(document.activeElement);

  const element = findFirstFocusable(container, reverse, excludeHighTabIndexes, excludeNaturalTabIndexes);
  if (isDefined(element)) { element.focus(); }
}

export function focusLast(container: HTMLElement, excludeHighTabIndexes?: boolean, excludeNaturalTabIndexes?: boolean) {
  return focusFirst(container, true, excludeHighTabIndexes, excludeNaturalTabIndexes);
}



////////////////////////////////////////////////////////////////////////////////
// aria-hidden
////////////////////////////////////////////////////////////////////////////////

export function hideOtherElements(element: HTMLElement) {
  const attribute = 'aria-hidden';
  const attributeValue = 'true';

  const {body} = document;
  const parent = element.parentElement;

  const hiddenElements =
      Array.from(parent.children).filter(child => child !== element && !isDefined(child.getAttribute(attribute)));
  hiddenElements.forEach(hiddenElement => hiddenElement.setAttribute(attribute, attributeValue));

  const revertParentSiblings = parent === body ? () => {} : hideOtherElements(parent);

  const revert = () => {
    hiddenElements.forEach(hiddenElement => hiddenElement.removeAttribute(attribute));
    revertParentSiblings();
  };

  return revert;
}



////////////////////////////////////////////////////////////////////////////////
// Intercepting
////////////////////////////////////////////////////////////////////////////////

export function createFocusInterceptor({onIntercept, tabIndex}) {
  if (!isDefined(tabIndex)) {
    tabIndex = 0;
  }

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

export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export interface InterceptorDescription {
  anchor: HTMLElement;
  position: InsertPosition;
  tabIndex?: number;
  setFocus: (element: HTMLElement) => any;
}

export function trapFocusInside(element: HTMLElement): () => any {
  const {body} = document;
  const interceptors = [
    {anchor: body, position: 'afterbegin', setFocus: (element) => focusFirst(element, false, true) },
    {anchor: body, position: 'afterbegin', tabIndex: 1, setFocus: (element) => focusLast(element, true) },
    {anchor: body, position: 'afterbegin', tabIndex: 1, setFocus: focusFirst },
    {anchor: element, position: 'beforebegin', setFocus: (element) => focusLast(element, false, true)},
    {anchor: element, position: 'afterend', setFocus: focusFirst},
    {anchor: body, position: 'beforeend', setFocus: focusLast}
  ].map(({anchor, position, tabIndex, setFocus}: InterceptorDescription) => {
    const interceptor = createFocusInterceptor({onIntercept: () => setFocus(element), tabIndex});
    anchor.insertAdjacentElement(position, interceptor);
    return interceptor;
  });

  const revertHiddenElements = hideOtherElements(element);

  const revert = () => {
    interceptors.forEach(interceptor => interceptor.remove());
    revertHiddenElements();
  };

  return revert;
}
