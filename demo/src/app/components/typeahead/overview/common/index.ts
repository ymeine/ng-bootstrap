import { NgbdTypeaheadOverviewCommonDebounceCustomizerComponent } from './debounce-customizer.component';
import { NgbdTypeaheadOverviewCommonCheckboxComponent } from './checkbox.component';

export * from './search';
export * from './styles';



export const COMPONENTS = [
  NgbdTypeaheadOverviewCommonDebounceCustomizerComponent,
  NgbdTypeaheadOverviewCommonCheckboxComponent,
];



export function fixIndent(source) {
  const lines = source.split(/(?:\r\n)|\n|\r/);
  lines.shift();
  const indentLevel = /( *).*/g.exec(lines[0])[1].length;
  return lines.map(line => line.substring(indentLevel)).join('\n');
}

export interface SnippetSpec {
  language: 'html' | 'typescript';
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
