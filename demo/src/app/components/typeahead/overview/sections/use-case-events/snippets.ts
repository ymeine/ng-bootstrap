import {Snippet} from '../../common';



export const SNIPPETS = {
  focus: {
    template: Snippet({
      language: 'html',
      highlightedLines: '4',
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          (focus)="onFocus($event)"
        />
      `,
    }),
    subject: Snippet({
      language: 'typescript',
      highlightedLines: '1, 4, 7',
      code: `
        import {Subject} from 'rxjs';

        export class MyComponent {
          private _inputFocus$ = new Subject<string>();

          onFocus(event: Event) {
            this._inputFocus$.next((event.target as HTMLInputElement).value);
          }
        }
      `,
    }),
    full: Snippet({
      language: 'typescript',
      highlightedLines: '3, 14, 15, 17-19',
      code: `
        import {
          Subject,
          merge,
        } from 'rxjs';

        export class MyComponent {
          private _inputFocus$ = new Subject<string>();

          onFocus(event: Event) {
            this._inputFocus$.next((event.target as HTMLInputElement).value);
          }

          initializeTypeahead = (text$: Observable<string>): Observable<string[]> => {
            const inputSource = text$.pipe(/* ... specific processing for input event ... */);
            const focusSource = this._inputFocus$.pipe(/* ... specific processing for focus event ... */);

            return merge(inputSource, focusSource).pipe(
              /* ... any additional common processing ... */
            );
          }
        }
      `,
    }),
    detail: {
      template: Snippet({
        language: 'html',
        highlightedLines: '5',
        code: `
          <input
            type="text"
            [ngbTypeahead]="initializeTypeahead"
            (focus)="onFocus($event)"
            #instance="ngbTypeahead"
          />
        `,
      }),
      component: Snippet({
        language: 'typescript',
        highlightedLines: '6, 10-11, 20',
        code: `
          import {Subject, merge} from 'rxjs';
          import {
            map,
            debounceTime,
            distinctUntilChanged,
            filter,
          } from 'rxjs/operators';

          export class MyComponent {
            // to get the reference to the Typeahead instance
            @ViewChild('instance') private _instance: NgbTypeahead;

            initializeTypeahead = (text$: Observable<string>): Observable<string[]> => {
              const inputSource = text$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
              );

              const focusSource = this._inputFocus$.pipe(
                filter(() => !this._instance.isPopupOpen()),
              );

              return merge(inputSource, focusSource).pipe(
                map(searchTerm => /* return the list */)
              );
            }
          }
        `,
      }),
    },
  },
  click: {
    template: Snippet({
      language: 'html',
      highlightedLines: '6',
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          #instance="ngbTypeahead"
          (focus)="onFocus($event)"
          (click)="onClick($event)"
        />
      `,
    }),
    intermediateComponent: Snippet({
      language: 'typescript',
      highlightedLines: '13, 19-21, 33-35, 40',
      code: `
        import {Subject, merge} from 'rxjs';
        import {
          map,
          debounceTime,
          distinctUntilChanged,
          filter,
        } from 'rxjs/operators';

        export class MyComponent {
          @ViewChild('instance') private _instance: NgbTypeahead;

          private _inputFocus$ = new Subject<string>();
          private _inputClick$ = new Subject<string>();

          onFocus(event: Event) {
            this._inputFocus$.next((event.target as HTMLInputElement).value);
          }

          onClick(event: Event) {
            this._inputClick$.next((event.target as HTMLInputElement).value);
          }

          initializeTypeahead = (text$: Observable<string>): Observable<string[]> => {
            const inputSource = text$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
            );

            const focusSource = this._inputFocus$.pipe(
              filter(() => this._instance.isPopupOpen()),
            );

            const clickSource = this._inputClick$.pipe(
              filter(() => this._instance.isPopupOpen()),
            );

            return merge(
              inputSource,
              focusSource,
              clickSource,
            ).pipe(
              map(searchTerm => /* return the list */)
            );
          }
        }
      `,
    }),
    component: Snippet({
      language: 'typescript',
      highlightedLines: '7, 16, 26-28, 37, 41, 49, 51',
      code: `
        import {Subject, merge} from 'rxjs';
        import {
          map,
          debounceTime,
          distinctUntilChanged,
          filter,
          tap,
        } from 'rxjs/operators';

        export class MyComponent {
          @ViewChild('instance') private _instance: NgbTypeahead;

          private _inputFocus$ = new Subject<string>();
          private _inputClick$ = new Subject<string>();

          private _searching = false;

          onFocus(event: Event) {
            this._inputFocus$.next((event.target as HTMLInputElement).value);
          }

          onClick(event: Event) {
            this._inputClick$.next((event.target as HTMLInputElement).value);
          }

          private _shouldSearchOnClickOrFocus(): boolean {
            return !this._searching && !this._instance.isPopupOpen();
          }

          initializeTypeahead = (text$: Observable<string>): Observable<string[]> => {
            const inputSource = text$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
            );

            const focusSource = this._inputFocus$.pipe(
              filter(() => this._shouldSearchOnClickOrFocus()),
            );

            const clickSource = this._inputClick$.pipe(
              filter(() => this._shouldSearchOnClickOrFocus()),
            );

            return merge(
              inputSource,
              focusSource,
              clickSource,
            ).pipe(
              tap(() => this._searching = true),
              map(searchTerm => /* return the list */)
              tap(() => this._searching = false),
            );
          }
        }
      `,
    }),
  },
};
