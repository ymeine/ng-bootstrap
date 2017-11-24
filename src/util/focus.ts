import {isDefined} from './util';

type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';



export function canBeFocused(element): boolean {
  let {nodeName} = element;
  nodeName = nodeName.toLowerCase();
  const {disabled} = element;
  const {href} = element;
  const tabIndex = element.getAttributeNode('tabindex');

  let result = false;

  // TODO Check visibility
  if (!disabled) {
    if (nodeName === 'input') {
      result = true;
    } else if (nodeName === 'button') {
      result = true;
    } else if (nodeName === 'a' && isDefined(href)) {
      result = true;
    } else if (nodeName === 'textarea') {
      result = true;
    } else if (nodeName === 'area' && isDefined(href)) {
      result = true;
    } else if (isDefined(tabIndex) && tabIndex.specified && tabIndex.nodeValue !== -1) {
      result = true;
    }
  }

  return result;
}

export function findFirstFocusable(element: HTMLElement, reverse?: boolean): HTMLElement {
  if (!isDefined(reverse)) {
    reverse = false;
  }

  const children = Array.from(element.children) as HTMLElement[];
  if (reverse) {
    children.reverse();
  }

  for (let index = 0, length = children.length; index < length; index++) {
    const child = children[index];

    if (canBeFocused(child)) {
      return child;
    }

    const descendent = findFirstFocusable(child, reverse);
    if (isDefined(descendent)) {
      return descendent;
    }
  }

  return null;
}

export function focusFirst(container: HTMLElement, reverse?: boolean) {
  if (!isDefined(reverse)) {
    reverse = false;
  }

  const element = findFirstFocusable(container, reverse);
  if (isDefined(element)) {
    element.focus();
  }
}

export function focusLast(container: HTMLElement) {
  return focusFirst(container, true);
}

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

export interface InterceptorDescription {
  anchor: HTMLElement;
  position: InsertPosition;
  setFocus: (element: HTMLElement) => any;
}

export function trapFocusInside(element: HTMLElement): () => any {
  const {body} = document;
  const interceptors = [
    {anchor: element, position: 'beforebegin', setFocus: focusLast},
    {anchor: element, position: 'afterend', setFocus: focusFirst},
    {anchor: body, position: 'afterbegin', setFocus: focusFirst},
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
