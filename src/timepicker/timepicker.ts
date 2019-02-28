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

import {isInteger, isNumber, padNumber, isDefined} from '../util/util';
import {NgbTime} from './ngb-time';
import {NgbTimepickerConfig} from './timepicker-config';
import {NgbTimeAdapter} from './ngb-time-adapter';

const NGB_TIMEPICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgbTimepicker),
  multi: true
};

interface PartWrapperSpec {
  format: (value: number) => string;
  getStep: () => number;
  update: (value: number) => void;
  change: (step: number) => void;
  getModel: () => NgbTime;
  getValue: (model: NgbTime) => number;
  afterChange: () => void;
}

interface IPartWrapper {
  formattedValue: string | null;
  increment: (step?: number) => void;
  decrement: (step?: number) => void;
  update: (value: number) => void;
}

class PartWrapper implements IPartWrapper {
  constructor(private spec: PartWrapperSpec) {}

  get formattedValue(): string | null {
    const model = this.spec.getModel();
    if (model == null) { return ''; }
    const value = this.spec.getValue(model);
    if (value == null) { return ''; }
    return this.spec.format(value);
  }

  _updateRelative(sign, givenStep) {
    const step = isDefined(givenStep) ? givenStep : this.spec.getStep();
    this.spec.change(sign * step);
    this.spec.afterChange();
  }
  increment(step?: number) { this._updateRelative(+1, step); }
  decrement(step?: number) { this._updateRelative(-1, step); }
  update(value: number) {
    this.spec.update(value);
    this.spec.afterChange();
  }
}

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

          [value]="hourWrapper.formattedValue"
          (increment)="hourWrapper.increment()" (decrement)="hourWrapper.decrement()" (valueChange)="hourWrapper.update($event)"
        ></ngb-timepicker-part>

        <div class="ngb-tp-spacer">:</div>

        <ngb-timepicker-part
          [spinners]="spinners" [disabled]="disabled" [readonly]="readonlyInputs" [size]="size"

          class-part="minute"
          placeholder="MM" i18n-placeholder="@@ngb.timepicker.MM"
          aria-label="Minutes" i18n-aria-label="@@ngb.timepicker.minutes"

          label-increment="Increment minutes" i18n-label-increment="@@ngb.timepicker.increment-minutes"
          label-decrement="Decrement minutes" i18n-label-decrement="@@ngb.timepicker.decrement-minutes"

          [value]="minuteWrapper.formattedValue"
          (increment)="minuteWrapper.increment()" (decrement)="minuteWrapper.decrement()" (valueChange)="minuteWrapper.update($event)"
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

          [value]="secondWrapper.formattedValue"
          (increment)="secondWrapper.increment()" (decrement)="secondWrapper.decrement()" (valueChange)="secondWrapper.update($event)"
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
            <ng-container
              *ngIf="model?.hour >= 12; else am"
              i18n="@@ngb.timepicker.PM"
            >
              PM
            </ng-container>
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

  hourWrapper: IPartWrapper;
  minuteWrapper: IPartWrapper;
  secondWrapper: IPartWrapper;

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

    const getModel = () => this.model;
    const afterChange = () => this.propagateModelChange();

    this.hourWrapper = new PartWrapper({
      getModel, afterChange,
      getStep: () => this.hourStep,
      getValue: (model) => model.hour,

      format: (value: number) => padNumber(!this.meridian
        ? value % 24
        : value % 12 === 0
          ? 12
          : value % 12
      ),

      update: (enteredHour) => {
        const isPM = this.model.hour >= 12;
        const realHourIsHigherThanInputHour = this.meridian && (isPM && enteredHour < 12 || !isPM && enteredHour === 12);

        return this.model.updateHour(!realHourIsHigherThanInputHour
          ? enteredHour
          : enteredHour + 12
        );
      },

      change: (step) => this.model.changeHour(step),
    });

    const formatMinSec = (value: number) => padNumber(value);

    this.minuteWrapper = new PartWrapper({
      getModel, afterChange,
      getStep: () => this.minuteStep,
      getValue: (model) => model.minute,

      format: formatMinSec,
      update: (value) => this.model.updateMinute(value),
      change: (step) => this.model.changeMinute(step),
    });

    this.secondWrapper = new PartWrapper({
      getModel, afterChange,
      getStep: () => this.secondStep,
      getValue: (model) => model.second,

      format: formatMinSec,
      update: (value) => this.model.updateSecond(value),
      change: (step) => this.model.changeSecond(step),
    });
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

  toggleMeridian() {
    if (this.meridian) {
      this.hourWrapper.increment(12);
    }
  }

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
