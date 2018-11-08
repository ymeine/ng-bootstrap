import {
  Observable,
} from 'rxjs';



export interface ObservableListeners<T, E = Error> {
  onNext?: (value: T) => void;
  onError?: (error: E) => void;
  onComplete?: () => void;
  onUnsubscribe?: () => void;
}

export interface WrapObservableOptions<T, E = Error> extends ObservableListeners<T, E> {
  observable: Observable<T>;
}
