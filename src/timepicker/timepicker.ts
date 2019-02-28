import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {isInteger, isNumber, padNumber, toInteger} from '../util/util';
import {NgbTime} from './ngb-time';
import {NgbTimepickerConfig} from './timepicker-config';
import {NgbTimeAdapter} from './ngb-time-adapter';

const NGB_TIMEPICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgbTimepicker),
  multi: true
};

/**
 * A lightweight & configurable timepicker directive.
 */
@Component({
  selector: 'ngb-timepicker',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./timepicker.scss'],
  template: `
    <fieldset [disabled]="disabled" [class.disabled]="disabled">
      <div class="ngb-tp">
        <ngb-timepicker-part
          [spinners]="spinners" [disabled]="disabled" [readonly]="readonlyInputs" [size]="size"

          class-part="hour"
          placeholder="HH" i18n-placeholder="@@ngb.timepicker.HH"
          aria-label="Hours" i18n-aria-label="@@ngb.timepicker.hours"

          label-increment="Increment hours" i18n-label-increment="@@ngb.timepicker.increment-hours"
          label-decrement="Decrement hours" i18n-label-decrement="@@ngb.timepicker.decrement-hours"

          [value]="formatHour(model?.hour)"
          (increment)="changeHour(+hourStep)" (decrement)="changeHour(-hourStep)" (valueChange)="updateHour($event)"
        ></ngb-timepicker-part>

        <div class="ngb-tp-spacer">:</div>

        <ngb-timepicker-part
          [spinners]="spinners" [disabled]="disabled" [readonly]="readonlyInputs" [size]="size"

          class-part="minute"
          placeholder="MM" i18n-placeholder="@@ngb.timepicker.MM"
          aria-label="Minutes" i18n-aria-label="@@ngb.timepicker.minutes"

          label-increment="Increment minutes" i18n-label-increment="@@ngb.timepicker.increment-minutes"
          label-decrement="Decrement minutes" i18n-label-decrement="@@ngb.timepicker.decrement-minutes"

          [value]="formatMinSec(model?.minute)"
          (increment)="changeMinute(+minuteStep)" (decrement)="changeMinute(-minuteStep)" (valueChange)="updateMinute($event)"
        ></ngb-timepicker-part>

        <div *ngIf="seconds" class="ngb-tp-spacer">:</div>

        <ngb-timepicker-part
          *ngIf="seconds"

          [spinners]="spinners" [disabled]="disabled" [readonly]="readonlyInputs" [size]="size"

          class-part="second"
          placeholder="SS" i18n-placeholder="@@ngb.timepicker.SS"
          aria-label="Seconds" i18n-aria-label="@@ngb.timepicker.seconds"

          label-increment="Increment seconds" i18n-label-increment="@@ngb.timepicker.increment-seconds"
          label-decrement="Decrement seconds" i18n-label-decrement="@@ngb.timepicker.decrement-seconds"

          [value]="formatMinSec(model?.second)"
          (increment)="changeSecond(+secondStep)" (decrement)="changeSecond(-secondStep)" (valueChange)="updateSecond($event)"
        ></ngb-timepicker-part>

        <div *ngIf="meridian" class="ngb-tp-spacer"></div>

        <div *ngIf="meridian" class="ngb-tp-meridian">
          <button
            type="button"
            [disabled]="disabled"

            class="btn btn-outline-primary"
            [class.btn-sm]="isSmallSize"
            [class.btn-lg]="isLargeSize"
            [class.disabled]="disabled"

            (click)="toggleMeridian()"
          >
            <ng-container *ngIf="model?.hour >= 12; else am" i18n="@@ngb.timepicker.PM">PM</ng-container>
            <ng-template #am i18n="@@ngb.timepicker.AM">AM</ng-template>
          </button>
        </div>
      </div>
    </fieldset>
  `,
  providers: [NGB_TIMEPICKER_VALUE_ACCESSOR]
})
export class NgbTimepicker implements ControlValueAccessor,
    OnChanges {
  disabled: boolean;
  model: NgbTime;

  private _hourStep: number;
  private _minuteStep: number;
  private _secondStep: number;

  /**
   * Whether to display 12H or 24H mode.
   */
  @Input() meridian: boolean;

  /**
   * Whether to display the spinners above and below the inputs.
   */
  @Input() spinners: boolean;

  /**
   * Whether to display seconds input.
   */
  @Input() seconds: boolean;

  /**
   * Number of hours to increase or decrease when using a button.
   */
  @Input()
  set hourStep(step: number) {
    this._hourStep = isInteger(step) ? step : this._config.hourStep;
  }

  get hourStep(): number { return this._hourStep; }

  /**
   * Number of minutes to increase or decrease when using a button.
   */
  @Input()
  set minuteStep(step: number) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }

  get minuteStep(): number { return this._minuteStep; }

  /**
   * Number of seconds to increase or decrease when using a button.
   */
  @Input()
  set secondStep(step: number) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }

  get secondStep(): number { return this._secondStep; }

  /**
   * To make timepicker readonly
   */
  @Input() readonlyInputs: boolean;

  /**
   * To set the size of the inputs and button
   */
  @Input() size: 'small' | 'medium' | 'large';

  constructor(
      private readonly _config: NgbTimepickerConfig, private _ngbTimeAdapter: NgbTimeAdapter<any>,
      private _cd: ChangeDetectorRef) {
    this.meridian = _config.meridian;
    this.spinners = _config.spinners;
    this.seconds = _config.seconds;
    this.hourStep = _config.hourStep;
    this.minuteStep = _config.minuteStep;
    this.secondStep = _config.secondStep;
    this.disabled = _config.disabled;
    this.readonlyInputs = _config.readonlyInputs;
    this.size = _config.size;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue ? new NgbTime(structValue.hour, structValue.minute, structValue.second) : new NgbTime();
    if (!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0;
    }
    this._cd.markForCheck();
  }

  registerOnChange(fn: (value: any) => any): void { this.onChange = fn; }

  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean) { this.disabled = isDisabled; }

  changeHour(step: number) {
    this.model.changeHour(step);
    this.propagateModelChange();
  }

  changeMinute(step: number) {
    this.model.changeMinute(step);
    this.propagateModelChange();
  }

  changeSecond(step: number) {
    this.model.changeSecond(step);
    this.propagateModelChange();
  }

  updateHour(newVal: string) {
    const isPM = this.model.hour >= 12;
    const enteredHour = toInteger(newVal);
    if (this.meridian && (isPM && enteredHour < 12 || !isPM && enteredHour === 12)) {
      this.model.updateHour(enteredHour + 12);
    } else {
      this.model.updateHour(enteredHour);
    }
    this.propagateModelChange();
  }

  updateMinute(newVal: string) {
    this.model.updateMinute(toInteger(newVal));
    this.propagateModelChange();
  }

  updateSecond(newVal: string) {
    this.model.updateSecond(toInteger(newVal));
    this.propagateModelChange();
  }

  toggleMeridian() {
    if (this.meridian) {
      this.changeHour(12);
    }
  }

  formatHour(value: number) {
    if (isNumber(value)) {
      if (this.meridian) {
        return padNumber(value % 12 === 0 ? 12 : value % 12);
      } else {
        return padNumber(value % 24);
      }
    } else {
      return padNumber(NaN);
    }
  }

  formatMinSec(value: number) { return padNumber(value); }

  get isSmallSize(): boolean { return this.size === 'small'; }

  get isLargeSize(): boolean { return this.size === 'large'; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seconds'] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0;
      this.propagateModelChange(false);
    }
  }

  private propagateModelChange(touched = true) {
    if (touched) {
      this.onTouched();
    }
    if (this.model.isValid(this.seconds)) {
      this.onChange(
          this._ngbTimeAdapter.toModel({hour: this.model.hour, minute: this.model.minute, second: this.model.second}));
    } else {
      this.onChange(this._ngbTimeAdapter.toModel(null));
    }
  }
}
