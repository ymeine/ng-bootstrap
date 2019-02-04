import {fixIndent} from '../../common';



export const SNIPPETS = {
  focus: {
    template: {
      language: 'html',
      code: fixIndent`
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          (focus)="onFocus($event)"
        />
      `,
    },
    component: {
      language: 'typescript',
      code: fixIndent`
        import {Subject, merge} from 'rxjs';

        // ...

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
    },
  },
  focusDetail: {
    template: {
      language: 'html',
      code: fixIndent`
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          (focus)="onFocus($event)"
          #instance="ngbTypeahead"
        />
      `,
    },
    component: {
      language: 'typescript',
      code: fixIndent`
        import {Subject, merge} from 'rxjs';
        import {map, debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';

        // ...

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
    },
  },
  click: {
    template: {
      language: 'html',
      code: fixIndent`
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          #instance="ngbTypeahead"
          (focus)="onFocus($event)"
          (click)="onClick($event)"
        />
      `,
    },
    component: {
      language: 'typescript',
      code: fixIndent`
        import {Subject, merge} from 'rxjs';
        import {map, debounceTime, distinctUntilChanged, filter, tap} from 'rxjs/operators';

        // ...

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

            return merge(inputSource, focusSource, clickSource).pipe(
              tap(() => this._searching = true),
              map(searchTerm => /* return the list */)
              tap(() => this._searching = false),
            );
          }
        }
      `,
    },
  },
};
