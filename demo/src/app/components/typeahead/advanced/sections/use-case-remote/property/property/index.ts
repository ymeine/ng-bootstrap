import {
  AnimatedProperty,
} from '../model';

import {
  IProperty,
  PropertySpec,
  SetValueArg,
  Updater,
} from './model';

export * from './model';



function isUpdater<T>(value: SetValueArg<T>): value is Updater<T> {
  return typeof value === 'function';
}

const defaultFormatValue = value => '' + value;

export class Property<T> implements IProperty<T> {
  value: T;
  animated = false;

  private _formatValue: (value: T) => string;

  constructor(private spec: PropertySpec<T>) {
    this.value = spec.initialValue;
    this._formatValue = spec.formatValue != null ? spec.formatValue : defaultFormatValue;
  }

  get formattedValue(): string { return this._formatValue(this.value); }
  get name(): AnimatedProperty { return this.spec.name; }
  get label(): string { return this.spec.label; }

  reset() { this.value = this.spec.initialValue; }

  setValue(valueOrUpdater: SetValueArg<T>) {
    const value = isUpdater(valueOrUpdater) ? valueOrUpdater(this.value) : valueOrUpdater;

    if (this.value === value) { return; }

    this.value = value;
    this.animated = true;
  }
}
