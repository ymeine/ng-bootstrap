import {Snippet} from '../../common';



export const SNIPPETS = {
  resultFormatter: {
    template: Snippet({
      language: 'html',
      highlightedLines: '4',
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
      highlightedLines: '2-4',
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
      highlightedLines: '2, 4-5, 17',
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
