import {
  Component,
  ChangeDetectorRef,
} from '@angular/core';

import {
  Observable,
  of,
  throwError,
} from 'rxjs';

import {
  map,
  delay,
  tap,
  switchMap,
  catchError,
  mergeMap,
} from 'rxjs/operators';

import {
  generateResults,
  customDebounce,
} from '../../common';



interface ObservableListeners<T, E = Error> {
  onNext?: (value: T) => void;
  onError?: (error: E) => void;
  onComplete?: () => void;
  onUnsubscribe?: () => void;
}

interface WrapObservableOptions<T, E = Error> extends ObservableListeners<T, E> {
  observable: Observable<T>;
}

interface SearchOptions {
  term: string;
  delay?: number;
  fail?: boolean;
  listeners?: ObservableListeners<string[]>;
}



const noop = () => {};

function wrapObservable<T>({
  observable,
  onNext = noop,
  onError = noop,
  onComplete = noop,
  onUnsubscribe = noop,
}: WrapObservableOptions<T>): Observable<T> {
  return Observable.create(observer => {
    const subscription = observable.subscribe({
        next: (value) => (onNext(value), observer.next(value)),
        error: (error) => (onError(error), observer.error(error)),
        complete: () => (onComplete(), observer.complete()),
    });

    return () => {
      onUnsubscribe();
      subscription.unsubscribe();
    };
  });
}

function search({
  term,
  delay: delayTime = 2000,
  fail = false,
  listeners = {},
}: SearchOptions): Observable<string[]> {
  const observable = of(term).pipe(
    delay(delayTime),
    mergeMap(value => !fail ? of(value) : throwError(new Error('Search failed'))),
    map(generateResults),
  );
  return wrapObservable({
    observable,
    ...listeners,
  });
}

// 2018-11-07T17:53:13+01:00 FIXME
// Closing the popup when launching a new search doesn't update the searching status properly
@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-async',
  templateUrl: './template.html',
})
export class NgbdTypeaheadOverviewSectionUseCaseAsyncComponent {
  model: string;
  debounceTime = 200;

  makeFail = false;
  responseDelay = 2000;

  searching = false;
  searchFailed = false;

  counterOnNext = 0;
  counterOnError = 0;
  counterOnComplete = 0;
  counterOnUnsubscribe = 0;

  currentValue = [];
  error = null;

  constructor(private _changeDetector: ChangeDetectorRef) {}

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),

    tap(this._onStartSearch.bind(this)),
    switchMap(term => {
      const observable = search({
        term,
        delay: this.responseDelay,
        fail: this.makeFail,
        listeners: {
          onNext: (value) => {
            this.counterOnNext++;
            this.currentValue = value;
            this._update();
          },
          onError: (error) => {
            this.counterOnError++;
            this.error = error;
            this._update();
          },
          onComplete: () => {
            this.counterOnComplete++;
            this._update();
          },
          onUnsubscribe: () => {
            this.counterOnUnsubscribe++;
            this._update();
          },
        },
      });

      return observable.pipe(
        catchError(() => {
          this._onSearchFailed();
          return of([]);
        }),
      );
    }),
    tap(this._onStopSearch.bind(this)),
  )

  resetCountersAndValues() {
    this.searching = false;
    this.searchFailed = false;

    this.counterOnNext = 0;
    this.counterOnError = 0;
    this.counterOnComplete = 0;
    this.counterOnUnsubscribe = 0;

    this.currentValue = [];
    this.error = null;

    this._update();
  }

  get formattedCurrentValue(): string {
    return JSON.stringify(this.currentValue);
  }

  get formattedError(): string {
    const { error } = this;
    return error == null ? '<none>' : error.message;
  }

  private _update() {
    this._changeDetector.detectChanges();
  }

  private _onStartSearch() {
    this.searching = true;
    this.searchFailed = false;
    this._update();
  }

  private _onStopSearch() {
    this.searching = false;
    this._update();
  }

  private _onSearchFailed() {
    this.searchFailed = true;
    this._update();
  }
}
