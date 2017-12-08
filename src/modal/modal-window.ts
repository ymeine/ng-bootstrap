import {
  Component,
  Output,
  EventEmitter,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import {ModalDismissReasons} from './modal-dismiss-reasons';
import {trapFocusInside} from '../util/focus';
import {isDefined} from '../util/util';

@Component({
  selector: 'ngb-modal-window',
  host: {
    '[class]': '"modal fade show" + (windowClass ? " " + windowClass : "")',
    'role': 'dialog',
    'tabindex': '-1',
    'style': 'display: block;',
    '(keyup.esc)': 'escKey($event)',
    '(click)': 'backdropClick($event)',
    '[attr.aria-label]': 'isDefined(ariaLabel) ? ariaLabel : null',
    '[attr.aria-labelledby]': 'isDefined(ariaLabelledBy) && !isDefined(ariaLabel) ? ariaLabelledBy : null',
    '[attr.aria-describedby]': 'isDefined(ariaDescribedBy) ? ariaDescribedBy : null'
  },
  template: `
    <div [class]="'modal-dialog' + (size ? ' modal-' + size : '')" role="document">
        <div class="modal-content"><ng-content></ng-content></div>
    </div>
    `
})
export class NgbModalWindow implements OnInit,
    AfterViewInit, OnDestroy {
  private _elWithFocus: Element;  // element that is focused prior to modal opening
  private _revertFocusTrap;

  @Input() backdrop: boolean | string = true;
  @Input() keyboard = true;
  @Input() size: string;
  @Input() windowClass: string;

  @Input() ariaLabel: string;
  @Input() ariaLabelledBy: string;
  @Input() ariaDescribedBy: string;

  @Output('dismiss') dismissEvent = new EventEmitter();

  constructor(private _elRef: ElementRef, private _renderer: Renderer2) {}

  isDefined() { return isDefined.apply(null, arguments); }

  backdropClick($event): void {
    if (this.backdrop === true && this._elRef.nativeElement === $event.target) {
      this.dismiss(ModalDismissReasons.BACKDROP_CLICK);
    }
  }

  escKey($event): void {
    if (this.keyboard && !$event.defaultPrevented) {
      this.dismiss(ModalDismissReasons.ESC);
    }
  }

  dismiss(reason): void { this.dismissEvent.emit(reason); }

  ngOnInit() {
    this._elWithFocus = document.activeElement;
    this._renderer.addClass(document.body, 'modal-open');
    this._revertFocusTrap = trapFocusInside(this._elRef.nativeElement);
  }

  ngAfterViewInit() {
    if (!this._elRef.nativeElement.contains(document.activeElement)) {
      this._elRef.nativeElement['focus'].apply(this._elRef.nativeElement, []);
    }
  }

  ngOnDestroy() {
    const body = document.body;
    const elWithFocus = this._elWithFocus;

    let elementToFocus;
    if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    elementToFocus['focus'].apply(elementToFocus, []);

    this._elWithFocus = null;
    this._renderer.removeClass(body, 'modal-open');

    this._revertFocusTrap();
  }
}
