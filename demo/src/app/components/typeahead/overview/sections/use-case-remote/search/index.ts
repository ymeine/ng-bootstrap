import {
  Observable,
  of,
  throwError,
} from 'rxjs';

import {
  map,
  delay,
  mergeMap,
} from 'rxjs/operators';

import {
  getResults,
} from '../../../common';

import {
  SearchOptions,
} from './model';

import {
  wrapObservable,
} from '../observable';

export * from './model';



export function search({
  term,
  delay: delayTime = 2000,
  fail = false,
  listeners = {},
}: SearchOptions): Observable<string[]> {
  const observable = of(term).pipe(
    delay(delayTime),
    mergeMap(value => !fail ? of(value) : throwError(new Error('Search failed'))),
    map(getResults),
  );
  return wrapObservable({
    observable,
    ...listeners,
  });
}
