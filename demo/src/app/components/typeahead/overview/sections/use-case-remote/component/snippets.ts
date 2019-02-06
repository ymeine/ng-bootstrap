import {Snippet} from '../../../common';



export const SNIPPETS = {
  cancellation: Snippet({
    language: 'typescript',
    highlightedLines: '3, 11',
    code: `
      import {
        map, debounceTime, distinctUntilChanged,
        switchMap,
      } from 'rxjs/operators';

      export class MyComponent {
        initializeTypeahead = (text$: Observable<string>): Observable<string[]> =>
          text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(/* return here an Observable on the result */),
          )
      }
    `,
  }),
  cancellationExample: Snippet({
    language: 'typescript',
    highlightedLines: '3-5',
    code: `
      text$.pipe(
        // ...
        switchMap(searchTerm => mySearchService(searchTerm).pipe(
          map(serviceResults => /* map to adapt the data coming from the service */)
        )),
        map(/* do any common mapping here (in case the remote data is not the only source) */),
      ),
    `,
  }),
  errorHandling: Snippet({
    language: 'typescript',
    highlightedLines: '3-4, 13-16',
    code: `
      import {
        map, debounceTime, distinctUntilChanged, switchMap,
        catchError,
        of,
      } from 'rxjs/operators';

      export class MyComponent {
        initializeTypeahead = (text$: Observable<string>): Observable<string[]> =>
          text$.pipe(
            // ...
            switchMap(searchTerm => mySearchService(searchTerm).pipe(
              map(serviceResults => /* ... */),
              // you could place it before or after:
              // as for JavaScript exceptions,
              // an error will go through until it reaches the catching section
              catchError(() => of([])),
            )),
            map(/* ... */),
          ),
      }
    `
  }),
  errorFlag: Snippet({
    language: 'typescript',
    highlightedLines: '3, 7, 12, 16-17',
    code: `
      import {
        map, debounceTime, distinctUntilChanged, switchMap, catchError, of,
        tap,
      } from 'rxjs/operators';

      export class MyComponent {
        failed = false;

        initializeTypeahead = (text$: Observable<string>): Observable<string[]> =>
          text$.pipe(
            // ...
            tap(() => this.failed = false),
            switchMap(searchTerm => mySearchService(searchTerm).pipe(
              map(serviceResults => /* ... */),
              catchError(() => {
                this.failed = true;
                return of([]);
              }),
            )),
            map(/* ... */),
          ),
      }
      `
  }),
};
