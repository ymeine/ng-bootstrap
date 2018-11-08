import {Snippet} from '../../common';



export const SNIPPETS = {
  inputFormatter: {
    template: Snippet({
      language: 'html',
      highlightedLines: '4',
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          [inputFormatter]="formatResultForInput"
        />
      `
    }),
    component: Snippet({
      language: 'typescript',
      highlightedLines: '2-4',
      code: `
        export class MyComponent {
          formatResultForInput(color: Color): string {
            return color.name.toUpperCase();
          }
        }
      `
    }),
  },
};
