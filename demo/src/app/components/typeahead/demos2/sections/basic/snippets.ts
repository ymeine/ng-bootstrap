import {Snippet} from '../../../advanced/common';



export const SNIPPETS = {
  template: Snippet({
    language: 'html',
    code: `
      <input
        type="text"
        [ngbTypeahead]="initializeTypeahead"
      />
    `,
  }),
  data: Snippet({
    language: 'typescript',
    code: `
      const COLORS = ['black', 'white', 'red', 'green', 'yellow', 'blue', 'brown', 'orange', 'pink', 'purple', 'grey'];
    `,
  }),
  component: Snippet({
    language: 'typescript',
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
};
