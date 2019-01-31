import {
  Component,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  customDebounce,
  fixIndent,
  STYLES,
  COLORS,
} from '../../common';



@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-basic',
  templateUrl: './template.html',
  styles: [
    STYLES,
  ]
})
export class NgbdTypeaheadOverviewSectionUseCaseBasicComponent {
  model: string;
  debounceTime = 200;

  snippets = {
    observableSetup: {
      template: {
        language: 'html',
        code: fixIndent`
          <input
            type="text"
            [ngbTypeahead]="initializeTypeahead"
          />
        `,
      },
      component: {
        language: 'typescript',
        code: fixIndent`
          export class MyComponent {
            // ...
            initializeTypeahead = (text$: Observable<string>): Observable<string[]> =>
              text$.pipe(
                // ...
                // do any processing you need
                // ...
              )
          }
        `,
      }
    },
    data: {
      language: 'typescript',
      code: fixIndent`
        const COLORS = ['black', 'white', 'red', 'green', 'yellow', 'blue', 'brown', 'orange', 'pink', 'purple', 'grey'];
      `,
    },
    observable: {
      mapping: {
        language: 'typescript',
        code: fixIndent`
          import {map} from 'rxjs/operators'; // <===
          // ...
          initializeTypeahead = (text$: Observable<string>): Observable<string[]> =>
            text$.pipe(
              // ===>
              map(pattern => pattern.length === 0
                ? COLORS
                : COLORS.filter(color => color.startsWith(pattern))
              ),
              // <===
            )
        `,
      },
      debouncing: {
        language: 'typescript',
        code: fixIndent`
          import {map, /* ===> */ debounceTime, distinctUntilChanged /* <=== */} from 'rxjs/operators';
          // ...
          initializeTypeahead = (text$: Observable<string>): Observable<string[]> =>
            text$.pipe(
              // ===>
              debounceTime(200),
              distinctUntilChanged(),
              // <===
              map(pattern => pattern.length === 0
                ? COLORS
                : COLORS.filter(color => color.startsWith(pattern))
              ),
            )
        `,
      },
    }
  };

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(pattern => pattern.length === 0
      ? COLORS
      : COLORS.filter(color => color.startsWith(pattern))
    ),
  )
}
