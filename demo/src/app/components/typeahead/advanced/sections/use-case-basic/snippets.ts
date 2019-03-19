import {Snippet} from '../../common';



export const SNIPPETS = {
  observableSetup: {
    template: Snippet({
      language: 'html',
      highlightedLines: '3',
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
        />
      `,
    }),
    component: Snippet({
      language: 'typescript',
      highlightedLines: '2-3',
      code: `
        export class MyComponent {
          initializeTypeahead = (input$: Observable<string>): Observable<string[]> =>
            input$.pipe(
              // ...
              // do any processing you need
              // ...
            )
        }
      `,
    }),
  },
  data: Snippet({
    language: 'typescript',
    code: `
      const COLORS = ['black', 'white', 'red', 'green', 'yellow', 'blue', 'brown', 'orange', 'pink', 'purple', 'grey'];
    `,
  }),
  observable: {
    mapping: Snippet({
      language: 'typescript',
      highlightedLines: '1, 5-8',
      code: `
        import {map} from 'rxjs/operators';
        // ...
        initializeTypeahead = (input$: Observable<string>): Observable<string[]> =>
          input$.pipe(
            map(searchTerm => searchTerm.length === 0
              ? COLORS
              : COLORS.filter(color => color.startsWith(searchTerm))
            ),
          )
      `,
    }),
    debouncing: {
      part1: Snippet({
        language: 'typescript',
        highlightedLines: '3, 8',
        code: `
          import {
            map,
            debounceTime,
          } from 'rxjs/operators';
          // ...
          initializeTypeahead = (input$: Observable<string>): Observable<string[]> =>
            input$.pipe(
              debounceTime(200),
              map(searchTerm => searchTerm.length === 0
                ? COLORS
                : COLORS.filter(color => color.startsWith(searchTerm))
              ),
            )
        `,
      }),
      part2: Snippet({
        language: 'typescript',
        highlightedLines: '4, 10',
        code: `
          import {
            map,
            debounceTime,
            distinctUntilChanged,
          } from 'rxjs/operators';
          // ...
          initializeTypeahead = (input$: Observable<string>): Observable<string[]> =>
            input$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              map(searchTerm => searchTerm.length === 0
                ? COLORS
                : COLORS.filter(color => color.startsWith(searchTerm))
              ),
            )
        `,
      }),
    },
  }
};