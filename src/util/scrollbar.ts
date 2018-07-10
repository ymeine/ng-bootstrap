import {Injectable, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';

import {isDefined} from './util';



@Injectable()
export class ScrollBar {
  constructor(@Inject(DOCUMENT) private _document) {}

  compensate() {
    if (!this.isPresent()) {
      return () => {};
    }
    const width = this.getWidth();
    return this.adjustBody(width);
  }

  adjustBody(width: number) {
    const {body} = this._document;
    const userSetPadding = body.style.paddingRight;
    const paddingAmount = parseFloat(window.getComputedStyle(body)['padding-right']);
    body.style['padding-right'] = `${paddingAmount + width}px`;
    return () => body.style['padding-right'] = userSetPadding;
  }

  isPresent(): boolean {
    const rect = this._document.body.getBoundingClientRect();
    return rect.left + rect.right < window.innerWidth;
  }

  getWidth(): number {
    const document = this._document;
    const {body} = document;

    const measurer = document.createElement('div');
    measurer.className = 'modal-scrollbar-measure';

    body.appendChild(measurer);
    const width = measurer.getBoundingClientRect().width - measurer.clientWidth;
    body.removeChild(measurer);

    return width;
  }
}
