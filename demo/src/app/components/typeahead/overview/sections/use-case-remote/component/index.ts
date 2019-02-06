import {
  Component,
  ChangeDetectorRef,
} from '@angular/core';

import {
  Observable,
  of,
} from 'rxjs';

import {
  tap,
  switchMap,
  catchError,
} from 'rxjs/operators';

import {
  customDebounce,
  STYLES,
} from '../../../common';

import {
  PropertiesMap,
} from '../property';

import {
  search,
} from '../search';

import { SNIPPETS } from './snippets';



export const increment = (value: number) => value + 1;



// 2018-11-07T17:53:13+01:00 FIXME
// Closing the popup when launching a new search doesn't update the searching status properly
@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-remote',
  templateUrl: './template.html',
  styles: [
    STYLES,
    `.flash {
      animation: blinker 2s linear;
    }

    @keyframes blinker {
      50% { background-color: rgb(192, 192, 192); }
    }`,
  ]
})
export class NgbdTypeaheadOverviewSectionUseCaseRemoteComponent {
  model: string;
  debounceTime = 200;

  makeFail = false;
  responseDelay = 2000;

  properties: PropertiesMap;

  snippets = SNIPPETS;

  constructor(changeDetector: ChangeDetectorRef) {
    this.properties = new PropertiesMap({
      animationDuration: 2000,
      update: () => changeDetector.detectChanges(),
      properties: {
        searching:            {label: 'searching'    , initialValue: false},
        searchFailed:         {label: 'search failed', initialValue: false},
        counterOnNext:        {label: 'next'         , initialValue: 0    },
        counterOnError:       {label: 'error'        , initialValue: 0    },
        counterOnComplete:    {label: 'complete'     , initialValue: 0    },
        counterOnUnsubscribe: {label: 'unsubscribe'  , initialValue: 0    },
        currentValue: {
          label: 'value',
          initialValue: [],
          formatValue: (value) => JSON.stringify(value),
        },
        error: {
          label: 'error',
          initialValue: null,
          formatValue: (error) => error == null ? '<none>' : error.message,
        },
      },
    });
  }

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),

    tap(() => this.properties.update({
      searching: true,
      searchFailed: false,
    })),
    switchMap(term => {
      const observable = search({
        term,
        delay: this.responseDelay,
        fail: this.makeFail,
        listeners: {
          onNext: (value) => this.properties.update({
            counterOnNext: increment,
            currentValue: value,
          }),
          onError: (error) => this.properties.update({
            counterOnError: increment,
            error,
          }),
          onComplete: () => this.properties.update({
            counterOnComplete: increment,
          }),
          onUnsubscribe: () => this.properties.update({
            counterOnUnsubscribe: increment,
          }),
        },
      });

      return observable.pipe(
        catchError(() => {
          this.properties.update({
            searchFailed: true,
          });
          return of([]);
        }),
      );
    }),
    tap(() => this.properties.update({
      searching: false,
    })),
  )

  resetProperties() { this.properties.reset(); }
}
