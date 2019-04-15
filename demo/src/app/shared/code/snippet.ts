export type Lang = 'html' | 'typescript' | 'css' | 'bash';

export type HighlightedLines = number | Array<number | [number, number]>;

export interface ISnippet {
  lang: Lang;
  code: string;
  highlightedLines?: HighlightedLines;
  showLineNumbers: boolean;
}

export interface SnippetInput {
  lang: Lang;
  code: string;
  highlightedLines?: HighlightedLines;
  showLineNumbers?: boolean;

  fixIndent?: boolean;
}

function removeEmptyLineAtIndex(lines: string[], index: number) {
  if (lines[index].trim().length === 0) {
    lines.splice(index, 1);
  }
}

function findIndentLevel(lines): number {
  return Math.min(...lines
    .map(line => {
      const result = /( *)[^ ]+/g.exec(line);
      return result == null ? null : result[1].length;
    })
    .filter(value => value != null)
  );
}

export function fixIndent(lines: string[]): string[] {
  removeEmptyLineAtIndex(lines, 0);
  removeEmptyLineAtIndex(lines, lines.length - 1);
  const indentLevel = findIndentLevel(lines);

  return lines.map(line => line.substring(indentLevel));
}

export function Snippet({lang, code, fixIndent: doFixIndent, highlightedLines, showLineNumbers}: SnippetInput): ISnippet {
  if (doFixIndent == null) { doFixIndent = true; }

  let lines = code.split(/(?:\r\n)|\n|\r/gi);

  if (doFixIndent) {
    lines = fixIndent(lines);
  }

  if (showLineNumbers == null && lines.length >= 10 && highlightedLines != null) {
    showLineNumbers = true;
  }

  return {
    lang,
    code: lines.join('\n'),
    highlightedLines,
    showLineNumbers,
  };
}
