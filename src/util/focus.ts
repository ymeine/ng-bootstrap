import {isDefined} from './util';



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

export function trapFocusInside(element: HTMLElement) {
  const backwardInterceptor = createFocusInterceptor({onIntercept: () => focusLast(element)});
  element.insertAdjacentElement('beforebegin', backwardInterceptor);
  const forwardInterceptor = createFocusInterceptor({onIntercept: () => focusFirst(element)});
  element.insertAdjacentElement('afterend', forwardInterceptor);

  const {body} = document;
  const viewportForwardInterceptor = createFocusInterceptor({onIntercept: () => focusFirst(element)});
  body.insertAdjacentElement('afterbegin', viewportForwardInterceptor);
  const viewportBackwardInterceptor = createFocusInterceptor({onIntercept: () => focusLast(element)});
  body.insertAdjacentElement('beforeend', viewportBackwardInterceptor);

  const revert = () => {
    backwardInterceptor.remove();
    forwardInterceptor.remove();

    viewportForwardInterceptor.remove();
    viewportBackwardInterceptor.remove();
  };

  return revert;
}
