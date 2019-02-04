import {
  Observable,
} from 'rxjs';

import {
  WrapObservableOptions,
} from './model';



export const noop = () => {};

export function wrapObservable<T>({
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
