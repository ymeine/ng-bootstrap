import {
  Observable,
  timer,
} from 'rxjs';

import {
  debounce,
  distinctUntilChanged,
} from 'rxjs/operators';

import { NgbdTypeaheadOverviewCommonDebounceCustomizerComponent } from './debounce-customizer.component';
import { NgbdTypeaheadOverviewCommonCheckboxComponent } from './checkbox.component';



export const COMPONENTS = [
  NgbdTypeaheadOverviewCommonDebounceCustomizerComponent,
  NgbdTypeaheadOverviewCommonCheckboxComponent,
];



export function times<T>(count: number, callback: (value: number) => T): T[] {
  const output = [];
  for (let index = 0; index < count; index++) {
    output.push(callback(index));
  }
  return output;
}



export function generateResults(term: string): string[] {
  return term === '' ? [] : times(5, value => (new Array(value + 1)).fill(term).join('-'));
}



export function customDebounce<T>(getTime: () => number): (observable: Observable<T>) => Observable<T> {
  return (observable) => observable.pipe(
    debounce(() => timer(getTime())),
    distinctUntilChanged(),
  );
}
