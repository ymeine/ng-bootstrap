import {Snippet} from '../../../../advanced/common';



export const SNIPPETS = {
  component: Snippet({
    language: 'typescript',
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
