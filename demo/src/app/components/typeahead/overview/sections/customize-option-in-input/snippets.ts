import {Snippet} from '../../../../../shared/code/snippet';



export const SNIPPETS = {
  inputFormatter: {
    template: Snippet({
      lang: 'html',
      highlightedLines: [4],
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          [inputFormatter]="formatResultForInput"
        />
      `
    }),
    component: Snippet({
      lang: 'typescript',
      highlightedLines: [[2, 4]],
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
