import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,

  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/core';

import {NgbAlertConfig} from './alert-config';

/**
 * Alerts can be used to provide feedback messages.
 */
@Component({
  selector: 'ngb-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'alert alert-' + type + (dismissible ? ' alert-dismissible' : '') + (false && visibilityState === 'shown' ? ' show' : '')"
      [@visibility]="visibilityState"
      role="alert"
    >
      <button *ngIf="dismissible" type="button" class="close" aria-label="Close" (click)="closeHandler()">
            <span aria-hidden="true">&times;</span>
      </button>
      <ng-content></ng-content>
    </div>
    `,
    animations: [
      trigger('visibility', [
        state('shown', style({
          opacity: '*'
          //height: 100
        })),
        /*state('hidden', style({
          opacity: '0'
        })),
        transition('shown => hidden', animate('0.15s linear')),*/
        transition(':leave', animate('2s linear', style({
            //height: 0
            opacity: 0
        })))
      ])
    ],
    host: {
      //'[@visibility]': 'visibilityState'
      /*'(@visibility.done)': 'animation_callback("done", $event)',
      '(@visibility.start)': 'animation_callback("start", $event)'*/
    }
})
export class NgbAlert {
  /**
   * A flag indicating if a given alert can be dismissed (closed) by a user. If this flag is set, a close button (in a
   * form of an ×) will be displayed.
   */
  @Input() dismissible: boolean;
  /**
   * Alert type (CSS class). Bootstrap 4 recognizes the following types: "success", "info", "warning" and "danger".
   */
  @Input() type: string;
  /**
   * An event emitted when the close button is clicked. This event has no payload. Only relevant for dismissible alerts.
   */
  @Output() close = new EventEmitter();

  private visibilityState: string = 'shown';

  constructor(config: NgbAlertConfig) {
    this.dismissible = config.dismissible;
    this.type = config.type;
  }

  closeHandler() {
    this.visibilityState = 'hidden';
    this.close.emit(null);
  }

  animation_callback(step, event) {
    console.log(step, event, this);
    /*if (step === 'start') {
      this.
    }*/
  }
}
