import {
  AnimatedProperty,
} from '../model';



export interface BasePropertySpec<T> {
  initialValue: T;
  label: string;
  formatValue?: (value: T) => string;
}

export interface PropertySpec<T> extends BasePropertySpec<T> {
  name: AnimatedProperty;
}

export type Updater<T> = (value: T) => T;
export type SetValueArg<T> = T | Updater<T>;

export interface IProperty<T> {
  name: AnimatedProperty;
  value: T;
  label: string;
  formattedValue: string;
  animated: boolean;
  setValue: (valueOrUpdater: SetValueArg<T>) => void;
  reset: () => void;
}
