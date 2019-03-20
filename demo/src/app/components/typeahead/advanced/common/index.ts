import { Component, Input } from '@angular/core';

import { Snippet as ISnippet } from '../../../../shared/code/code.component';

import { NgbdTypeaheadCommonDebounceCustomizerComponent } from './debounce-customizer.component';
import { NgbdTypeaheadCommonCheckboxComponent } from './checkbox.component';

export * from './search';
export * from './styles';

@Component({
  selector: 'ngbd-operator-popup',
  template: `{{name}}`
})
export class NgbdOperatorPopup {
  @Input() name;
}

export const COMPONENTS = [
  NgbdTypeaheadCommonDebounceCustomizerComponent,
  NgbdTypeaheadCommonCheckboxComponent,
  NgbdOperatorPopup,
];



export function fixIndent(source) {
  const lines = source.split(/(?:\r\n)|\n|\r/);
  lines.shift();
  lines.pop();
  const indentLevel = /( *).*/g.exec(lines[0])[1].length;
  return lines
    .map(line => line.substring(indentLevel))
    .join('\n');
}


export function Snippet({language, code, highlightedLines, showLineNumbers}: ISnippet): ISnippet {
  code = fixIndent(code);

  const lines = code.split(/(?:\r\n)|\n|\r/gi);
  if (showLineNumbers == null && lines.length >= 10 && highlightedLines != null) {
    showLineNumbers = true;
  }

  return {
    language,
    code,
    highlightedLines,
    showLineNumbers,
  };
}
