import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import {NgbAlertConfig} from './alert-config';

/**
 * Alerts can be used to provide feedback messages.
 */
@Component({
  selector: 'ngb-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'alert alert-' + type + (dismissible ? ' alert-dismissible' : '')"
      role="alert"

      [@visibility]="visibilityState"
      (@visibility.start)="onAnimationStart($event)"
      (@visibility.done)="onAnimationEnd($event)"
    >
      <button *ngIf="dismissible" type="button" class="close" aria-label="Close" (click)="closeHandler()">
            <span aria-hidden="true">&times;</span>
      </button>
      <ng-content></ng-content>
    </div>
    `,
    animations: [
      trigger('visibility', [
        state('visible', style({
          opacity: '*'
        })),
        state('hidden', style({
          opacity: '0'
        })),
        transition('visible => hidden', animate('0.15s linear'))
      ])
    ]
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

  @Output() visibilityStateChange = new EventEmitter();

  visibilityState = 'visible';

  constructor(config: NgbAlertConfig) {
    this.dismissible = config.dismissible;
    this.type = config.type;
  }

  closeHandler() {
    this.visibilityState = 'hidden';
    this.close.emit(null);
  }

  onAnimationStart({toState}) {
    const visibilityStateChange = this.visibilityStateChange;

    if (toState === 'hidden') {
      visibilityStateChange.emit('hiding');
    } else if (toState === 'visible') {
      visibilityStateChange.emit('showing');
    }
  }

  onAnimationEnd({toState}) {
    const visibilityStateChange = this.visibilityStateChange;

    if (toState === 'hidden') {
      visibilityStateChange.emit('hidden');
    } else if (toState === 'visible') {
      visibilityStateChange.emit('visible');
    }
  }
}
