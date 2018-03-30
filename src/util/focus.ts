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

export function getTabbable(root: HTMLElement, excludeHighTabIndexes?: boolean): HTMLElement[] {
  if (!isDefined(excludeHighTabIndexes)) {
    excludeHighTabIndexes = false;
  }

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
  .filter(wrapper => excludeHighTabIndexes ? wrapper.tabIndex === Infinity : wrapper.tabIndex >= 0)
  .filter(wrapper => !isElementHiddenOrDisabled(wrapper.element))
  .sort((a, b) => a.tabIndex === b.tabIndex ? a.index - b.index : a.tabIndex - b.tabIndex)
  .map(wrapper => wrapper.element);
}

export function findFirstFocusable(element: HTMLElement, reverse?: boolean, excludeHighTabIndexes?: boolean): HTMLElement {
  if (!isDefined(reverse)) { reverse = false; }

  const children = getTabbable(element, excludeHighTabIndexes);
  console.log('tabbable elements');
  console.log(children);
  const index = reverse ? children.length - 1 : 0;

  return children[index];
}

export function focusFirst(container: HTMLElement, reverse?: boolean, excludeHighTabIndexes?: boolean) {
  if (!isDefined(reverse)) { reverse = false; }

  if (reverse) {
    console.log('focusing last');
  } else {
    console.log('focusing first');
  }
  console.log('active element');
  console.log(document.activeElement);

  const element = findFirstFocusable(container, reverse, excludeHighTabIndexes);
  if (isDefined(element)) { element.focus(); }
}

export function focusLast(container: HTMLElement, excludeHighTabIndexes?: boolean) {
  return focusFirst(container, true, excludeHighTabIndexes);
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

export function createFocusInterceptor({onIntercept}) {
  const element = document.createElement('div');

  const style = element.style;
  style.width = '0';
  style.height = '0';
  element.setAttribute('aria-hidden', 'true');

  element.tabIndex = 0;
  style.position = 'fixed';
  element.addEventListener('focus', onIntercept);

  return element;
}

export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export interface InterceptorDescription {
  anchor: HTMLElement;
  position: InsertPosition;
  setFocus: (element: HTMLElement) => any;
}

export function trapFocusInside(element: HTMLElement): () => any {
  const {body} = document;
  const interceptors = [
    {anchor: body, position: 'afterbegin', setFocus: (element) => focusFirst(element, false, true) },
    {anchor: element, position: 'beforebegin', setFocus: focusLast},
    {anchor: element, position: 'afterend', setFocus: focusFirst},
    {anchor: body, position: 'beforeend', setFocus: focusLast}
  ].map(({anchor, position, setFocus}: InterceptorDescription) => {
    const interceptor = createFocusInterceptor({onIntercept: () => setFocus(element)});
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
