import {Injectable, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';


const noop = () => {};



/** Type for the callback used to revert the scrollbar compensation. */
export type CompensationReverter = () => void;



/**
 * Utility to handle the scrollbar.
 *
 * It allows to compensate the lack of a vertical scrollbar by adding an
 * equivalent padding on the right of the body, and to remove this compensation.
 */
@Injectable()
export class ScrollBar {
  private _width: number = null;

  constructor(@Inject(DOCUMENT) private _document) {}

  /**
   * Detects if a scrollbar is present and if yes, already compensates for its
   * removal by adding an equivalent padding on the right of the body.
   *
   * @return a callback used to revert the compensation (noop if there was none,
   * otherwise a function removing the padding)
   */
  compensate(): CompensationReverter {
    if (!this._isPresent()) {
      return noop;
    }
    const width = this._getWidth();
    return this._adjustBody(width);
  }

  /**
   * Adds a padding of the size of a scrollbar on the right of the body.
   *
   * @return a callback used to remove this padding
   */
  private _adjustBody(width: number): CompensationReverter {
    const {body} = this._document;
    const userSetPadding = body.style.paddingRight;
    const paddingAmount = parseFloat(window.getComputedStyle(body)['padding-right']);
    body.style['padding-right'] = `${paddingAmount + width}px`;
    return () => body.style['padding-right'] = userSetPadding;
  }

  /**
   * Tells whether a scrollbar is currently present on the body.
   *
   * @return true if scrollbar is present, false otherwise
   */
  private _isPresent(): boolean {
    const rect = this._document.body.getBoundingClientRect();
    return rect.left + rect.right < window.innerWidth;
  }

  /**
   * Calculates and returns the width of a scrollbar. Result is cached.
   *
   * @return the width of a scrollbar on this page
   */
  private _getWidth(): number {
    if (this._width != null) {
      return this._width;
    }

    const document = this._document;
    const {body} = document;

    const measurer = document.createElement('div');
    measurer.className = 'modal-scrollbar-measure';

    body.appendChild(measurer);
    const width = measurer.getBoundingClientRect().width - measurer.clientWidth;
    body.removeChild(measurer);

    this._width = width;
    return width;
  }
}
