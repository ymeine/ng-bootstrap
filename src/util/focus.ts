import {DOCUMENT} from '@angular/common';
import {
  Injectable,
  Directive, ElementRef, Input, Inject,
  OnChanges, SimpleChanges,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';

import {isDefined} from './util';



////////////////////////////////////////////////////////////////////////////////
// Iterating
////////////////////////////////////////////////////////////////////////////////

export type CollectionIteratorFilter<T, M = T> = (item: T, index: number, collection: T[]) => {exclude: boolean, value: M};

export function getFirst<T, M = T>(collection: T[], filter: CollectionIteratorFilter<T, M>): M {
  for (let index = 0, length = collection.length; index < length; index++) {
    const {exclude, value} = filter(collection[index], index, collection);
    if (!exclude) { return value; }
  }
}

export function getLast<T, M = T>(collection: T[], filter: CollectionIteratorFilter<T, M>): M {
  for (let index = collection.length - 1; index >= 0; index--) {
    const {exclude, value} = filter(collection[index], index, collection);
    if (!exclude) { return value; }
  }
}



////////////////////////////////////////////////////////////////////////////////
// Focusing
////////////////////////////////////////////////////////////////////////////////

export function safeFocus(element: HTMLElement, document): boolean {
  if (element && isDefined(element['focus']) && document.body.contains(element)) {
    element.focus();
    return true;
  }
  return false;
}

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

function createPotentialTabbableFilter() {
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

export function focusFirstFound(root: HTMLElement, document, reverse?: boolean) {
  safeFocus(
    (reverse ? getLast : getFirst)<HTMLElement>(getPotentialTabbable(root), createPotentialTabbableFilter()),
    document
  );
}

export function focusFirst(root: HTMLElement, document) { focusFirstFound(root, document);       }
export function focusLast(root: HTMLElement, document)  { focusFirstFound(root, document, true); }



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

  element.classList.add('sr-only');
  element.setAttribute('aria-hidden', 'true');

  element.tabIndex = 0;
  element.addEventListener('focus', onIntercept);

  return element;
}

interface SpecInterceptor {
  anchor: HTMLElement;
  position: InsertPosition;
  setFocus: (root: HTMLElement, document) => any;
}

export function trapFocusInside(element: HTMLElement, document): () => any {
  const {body} = document;
  const interceptors = ([
    {anchor: body   , position: 'afterbegin' ,  setFocus: focusFirst },
    {anchor: element, position: 'beforebegin',  setFocus: focusLast  },
    {anchor: element, position: 'afterend'   ,  setFocus: focusFirst },
    {anchor: body   , position: 'beforeend'  ,  setFocus: focusLast  }
  ] as SpecInterceptor[]).map(({anchor, position, setFocus}) => {
    const interceptor = createFocusInterceptor(() => setFocus(element, document));
    anchor.insertAdjacentElement(position, interceptor);
    return interceptor;
  });

  const revertHiddenElements = hideOtherElements(element);

  let previouslyFocused = null;
  if (!element.contains(document.activeElement)) {
    previouslyFocused = document.activeElement;
    focusFirst(element, document);
  }

  return () => {
    interceptors.forEach(interceptor => interceptor.parentElement.removeChild(interceptor));
    revertHiddenElements();
    if (!safeFocus(previouslyFocused, document)) {
      document.body.focus();
    }
  };
}



////////////////////////////////////////////////////////////////////////////////
// Service
////////////////////////////////////////////////////////////////////////////////

@Injectable()
export class FocusTrap {
  trap(element: HTMLElement, document): () => any { return trapFocusInside(element, document); }
}



////////////////////////////////////////////////////////////////////////////////
// Service
////////////////////////////////////////////////////////////////////////////////

@Directive({selector: '[ngbFocusTrap]'})
export class FocusTrapDirective implements OnChanges, OnDestroy {
  @Input('ngbFocusTrap') trapped = true;
  private _revert: () => any = null;

  constructor(private _element: ElementRef, private _focusTrap: FocusTrap, @Inject(DOCUMENT) private _document) {}
  ngOnChanges(changes: SimpleChanges) { if (changes['trapped']) { this.update(); } }
  ngOnDestroy() { this.revert(); }

  private update() { if (!this.isTrapped) { this.revert(); } else { this.trap(); } }

  private get isTrapped(): boolean { return !(this.trapped === false); }
  private trap() { this._revert = this._focusTrap.trap(this._element.nativeElement, this._document); }
  private revert() {
    if (isDefined(this._revert)) {
      this._revert();
      this._revert = null;
    }
  }
}
