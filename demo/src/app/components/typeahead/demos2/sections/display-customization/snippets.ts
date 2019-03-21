import {Snippet} from '../../../advanced/common';



export const SNIPPETS = {
  data: Snippet({
    language: 'typescript',
    code: `
      interface Color {
        name: string;
        hexCode: string;
      }

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
      code: `
        <input
          type="text"
          [ngbTypeahead]="initializeTypeahead"
          [resultFormatter]="formatResultForPopup"
        />
      `
    }),
    component: Snippet({
      language: 'typescript',
      code: `
        export class MyComponent {
          formatResultForPopup(color: Color): string {
            return \`\${color.name} (\${color.hexCode})\`;
          }
        }
      `
    }),
  },
  resultTemplate: {
    html: Snippet({
      language: 'html',
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
  },
  inputFormatter: {
    template: Snippet({
      language: 'html',
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
