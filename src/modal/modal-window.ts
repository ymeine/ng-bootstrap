import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';

import {getFocusableBoundaryElements} from '../util/focus-trap';
import {ModalDismissReasons} from './modal-dismiss-reasons';
import {Transition} from '../util/transition/ngbTransition';

@Component({
  selector: 'ngb-modal-window',
  host: {
    '[class]': '"modal d-block" + (windowClass ? " " + windowClass : "")',
    '[class.fade]': 'enableAnimation',
    'role': 'dialog',
    'tabindex': '-1',
    '(keyup.esc)': 'escKey($event)',
    '(click)': 'backdropClick($event)',
    '[attr.aria-modal]': 'true',
    '[attr.aria-labelledby]': 'ariaLabelledBy',
  },
  template: `
    <div [class]="'modal-dialog' + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '')" role="document">
        <div class="modal-content"><ng-content></ng-content></div>
    </div>
    `
})
export class NgbModalWindow implements OnInit, AfterViewInit, OnDestroy {
  private _elWithFocus: Element;  // element that is focused prior to modal opening

  @Input() enableAnimation = true;
  @Input() ariaLabelledBy: string;
  @Input() backdrop: boolean | string = true;
  @Input() centered: string;
  @Input() keyboard = true;
  @Input() size: string;
  @Input() windowClass: string;

  @Output('dismiss') dismissEvent = new EventEmitter();

  private _fadingTransition: Transition;

  constructor(@Inject(DOCUMENT) private _document: any, private _elRef: ElementRef<HTMLElement>, private _renderer: Renderer2) {
    this._fadingTransition = new Transition({classname: 'show'}, this._renderer);
  }

  hide(): Promise<any> {
    return this._fadingTransition.hide(this._elRef.nativeElement, {enableAnimation: this.enableAnimation});
  }

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
    this._elWithFocus = this._document.activeElement;
  }

  ngAfterViewInit() {
    const nativeElement = this._elRef.nativeElement;
    setTimeout(() => {
      this._fadingTransition.show(nativeElement, {
        enableAnimation: this.enableAnimation
      }).then(() => {
        if (!nativeElement.contains(document.activeElement)) {
          const autoFocusable = this._elRef.nativeElement.querySelector(`[ngbAutofocus]`) as HTMLElement;
          const firstFocusable = getFocusableBoundaryElements(this._elRef.nativeElement)[0];

          const elementToFocus = autoFocusable || firstFocusable || this._elRef.nativeElement;
          elementToFocus.focus();
        }
      });
    }, 0);
  }

  ngOnDestroy() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;

    let elementToFocus;
    if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    elementToFocus.focus();
    this._elWithFocus = null;
  }
}
