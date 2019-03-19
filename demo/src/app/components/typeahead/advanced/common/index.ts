import { Component, Input } from '@angular/core';

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
  const indentLevel = /( *).*/g.exec(lines[0])[1].length;
  return lines.map(line => line.substring(indentLevel)).join('\n');
}

export interface SnippetSpec {
  language: 'html' | 'typescript' | 'css';
  code: string;
  highlightedLines?: string;
}

export function Snippet(spec: SnippetSpec): SnippetSpec {
  return {
    language: spec.language,
    code: fixIndent(spec.code),
    highlightedLines: spec.highlightedLines,
  };
}
