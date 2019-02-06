import {Snippet} from '../../common';



export const SNIPPETS = {
  model: Snippet({
    language: 'typescript',
    code: `
      interface Color {
        name: string;
        hexCode: string;
      }
    `
  }),
  data: Snippet({
    language: 'typescript',
    code: `
      const COLORS = [
        {name: 'black', hexCode: '000000'},
        {name: 'white', hexCode: 'FFFFFF'},
        {name: 'red', hexCode: 'FF0000'},
        {name: 'green', hexCode: '008000'},
        {name: 'yellow', hexCode: 'FFFF00'},
        {name: 'blue', hexCode: '0000FF'},
        {name: 'brown', hexCode: 'A52A2A'},
        {name: 'orange', hexCode: 'FFA500'},
        {name: 'pink', hexCode: 'FFC0CB'},
        {name: 'purple', hexCode: '800080'},
        {name: 'grey', hexCode: '808080'},
      ];
    `
  }),
  resultFormatter: {
    template: Snippet({
      language: 'html',
      highlightedLines: '4',
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          [resultFormatter]="formatResult"
        />
      `
    }),
    component: Snippet({
      language: 'typescript',
      highlightedLines: '4',
      code: `
        export class MyComponent {
          formatResult(color: Color): string {
            return ``${color.name} (${color.hexCode})``;
          }
        }
      `
    }),
  },
};
