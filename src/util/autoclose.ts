import {NgZone} from '@angular/core';

import {Observable, fromEvent, race} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

import {Key} from './key';



export type AutoCloseMode = boolean | 'inside' | 'outside';



export function shouldCloseFromClick({event, autoClose, isEventFromToggle, isEventFromInside}: {
  event: MouseEvent,
  autoClose: AutoCloseMode,
  isEventFromToggle: (event: MouseEvent) => boolean,
  isEventFromInside: (event: MouseEvent) => boolean
}): boolean {
  if (event.button !== 2 && !isEventFromToggle(event)) {
    if (autoClose === true) {
      return true;
    } else if (autoClose === 'inside' && isEventFromInside(event)) {
      return true;
    } else if (autoClose === 'outside' && isEventFromInside(event)) {
      return true
    }
  }
  return false;
}

export function listenForAutoClose({autoClose, openChange, shouldCloseFromClick: _shouldCloseFromClick, close, document, ngZone}: {
  autoClose: AutoCloseMode,
  openChange: Observable<boolean>,
  shouldCloseFromClick: (event: MouseEvent) => boolean,
  close: () => any,
  document: Document,
  ngZone: NgZone
}) {
  if (autoClose) {
    ngZone.runOutsideAngular(() => {
      const escapes$ = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
        takeUntil(openChange.pipe(filter(open => !open))),
        filter(event => event.which === Key.Escape)
      );

      const clicks$ = fromEvent<MouseEvent>(document, 'click').pipe(
        takeUntil(openChange.pipe(filter(open => !open))),
        filter(event => _shouldCloseFromClick(event))
      );

      race<Event>([escapes$, clicks$]).subscribe(() => ngZone.run(() => close()));
    });
  }
}
