import {Injectable, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';

import {isDefined} from './util';



@Injectable()
export class Scrollbar {
  constructor(@Inject(DOCUMENT) private _document) {}

  compensateScrollbar() {
    if (!this.isScrollbarPresent()) {
      return () => {};
    }
    const scrollbarWidth = this.getScrollbarWidth();
    return this.adjustElementForScrollbar(scrollbarWidth);
  }

  adjustElementForScrollbar(scrollbarWidth: number) {
    const element = this._document.body;
    const userSetPadding = element.style.paddingRight;
    const paddingAmount = parseFloat(window.getComputedStyle(element)['padding-right']);
    element.style['padding-right'] = `${paddingAmount + scrollbarWidth}px`;
    return () => element.style['padding-right'] = userSetPadding;
  }

  isScrollbarPresent(): boolean {
    const element = this._document.body;
    const rect = element.getBoundingClientRect();
    return rect.left + rect.right < window.innerWidth;
  }

  getScrollbarWidth(): number {
    const document = this._document;
    const element = document.body;

    const measurer = document.createElement('div');
    measurer.className = 'modal-scrollbar-measure';

    element.appendChild(measurer);
    const scrollbarWidth = measurer.getBoundingClientRect().width - measurer.clientWidth;
    element.removeChild(measurer);

    return scrollbarWidth;
  }
}
