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
      const COLORS: Color[] = [
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
      highlightedLines: '2-4',
      code: `
        export class MyComponent {
          formatResult(color: Color): string {
            return \`\${color.name} (\${color.hexCode})\`;
          }
        }
      `
    }),
  },
  resultTemplate: {
    html: Snippet({
      language: 'html',
      highlightedLines: '2, 4-5, 8, 10, 12, 19',
      code: `
        <ng-template
          #displayResult

          let-color="result"
          let-term="term"
        >
          <div class="middle">
            <div class="color-chip" [ngStyle]="{'background-color': '#' + color.hexCode}"></div>

            <ngb-highlight [result]="color.name" [term]="term"></ngb-highlight>

            <span> ({{color.hexCode}})</span>
          </div>
        </ng-template>

        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          [resultTemplate]="displayResult"
        />
      `
    }),
    css: Snippet({
      language: 'css',
      code: `
        .middle > * {
          vertical-align: middle;
        }

        .color-chip {
          display: inline-block;
          height: 1em;
          width: 1em;
          border-radius: 0.5em;
          border: solid black 1px;
          margin-right: 0.30em;
          margin-top: 2px;
        }
      `
    })
  },
  inputFormatter: {
    template: Snippet({
      language: 'html',
      highlightedLines: '4',
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          [inputFormatter]="formatResult"
        />
      `
    }),
    component: Snippet({
      language: 'typescript',
      highlightedLines: '2-4',
      code: `
        export class MyComponent {
          formatInput(color: Color): string {
            return color.name.toUpperCase();
          }
        }
      `
    }),
  },
};
