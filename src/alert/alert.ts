import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Renderer2,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

import {NgbAlertConfig} from './alert-config';
import { Transition } from '../util/transition/ngbTransition';
import { NgbTransitionService } from '../util/transition/ngbTransitionService';

/**
 * Alerts can be used to provide feedback messages.
 */
@Component({
  selector: 'ngb-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'alert',
    'class': 'alert',
    '[class.show]': 'shown',
    '[class.alert-dismissible]': 'dismissible',
    '[class.fade]': 'enableAnimation',
  },
  template: `
    <button
      *ngIf="dismissible"
      type="button"
      class="close"
      aria-label="Close"
      i18n-aria-label="@@ngb.alert.close"
      (click)="closeHandler()"
    >
      <span aria-hidden="true">&times;</span>
    </button>
    <ng-content></ng-content>
    `,
  styleUrls: ['./alert.scss']
})
export class NgbAlert implements OnInit,
    OnChanges {
  private _fadingTransition: Transition;

  shown = false;

  /**
   * A flag indicating if a given alert can be dismissed (closed) by a user. If this flag is set, a close button (in a
   * form of an ×) will be displayed.
   */
  @Input() dismissible: boolean;
  /**
   * Alert type (CSS class). Bootstrap 4 recognizes the following types: "success", "info", "warning", "danger",
   * "primary", "secondary", "light", "dark".
   */
  @Input() type: string;
  /**
   * A flag to enable/disable the animation when closing.
   */
  @Input() enableAnimation: boolean;
  /**
   * An event emitted when the close button is clicked. This event has no payload. Only relevant for dismissible alerts.
   */
  @Output() close = new EventEmitter<void>();

  constructor(
    config: NgbAlertConfig,
    private _renderer: Renderer2,
    private _element: ElementRef,
    _transitionService: NgbTransitionService,
  ) {
    this.dismissible = config.dismissible;
    this.type = config.type;
    this.enableAnimation = config.enableAnimation;

    this._fadingTransition = new Transition({classname: 'show'}, this._renderer);

    const element = _element.nativeElement;
    _transitionService.registerBeforeDestroyHook(element, () => {
      return this._fadingTransition.hide(element, {enableAnimation: this.enableAnimation});
    });
  }

  closeHandler() { this.close.emit(null); }

  ngOnChanges(changes: SimpleChanges) {
    const typeChange = changes['type'];
    if (typeChange && !typeChange.firstChange) {
      this._renderer.removeClass(this._element.nativeElement, `alert-${typeChange.previousValue}`);
      this._renderer.addClass(this._element.nativeElement, `alert-${typeChange.currentValue}`);
    }
  }

  ngOnInit() {
    this._renderer.addClass(this._element.nativeElement, `alert-${this.type}`);
    if (!this.enableAnimation) {
      this.shown = true;
    } else {
      setTimeout(() => this.shown = true, 100);
    }
  }
}
