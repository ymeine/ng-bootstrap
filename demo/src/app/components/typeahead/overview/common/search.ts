import {
  Observable,
  timer,
} from 'rxjs';

import {
  debounce,
  distinctUntilChanged,
} from 'rxjs/operators';

export function customDebounce<T>(getTime: () => number): (observable: Observable<T>) => Observable<T> {
  return (observable) => observable.pipe(
    debounce(() => timer(getTime())),
    distinctUntilChanged(),
  );
}

export const COLORS = ['black', 'white', 'red', 'green', 'yellow', 'blue', 'brown', 'orange', 'pink', 'purple', 'grey'];

export function getResults(term: string) {
  return term === '' ? COLORS : COLORS.filter(color => color.startsWith(term));
}
