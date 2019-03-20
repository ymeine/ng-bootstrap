import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from '@angular/core';

import {CodeHighlightService} from './code-highlight.service';

export type HighlightedLines = number | Array<number | [number, number]>;
export interface Snippet {
  language: 'html' | 'typescript' | 'css';
  code: string;
  highlightedLines?: HighlightedLines;
  showLineNumbers?: boolean;
}


@Component({
  selector: 'ngbd-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre
      [ngClass]="preClass"
    ><code
      #codeEl
      [ngClass]="language"
    >{{code.trim()}}</code></pre>
  `,
})
export class NgbdCodeComponent implements AfterViewInit {

  @ViewChild('codeEl') codeEl: ElementRef<HTMLElement>;

  @Input('code') _code = '';
  @Input('lang') _lang = '';
  @Input('showLineNumbers') _showLineNumbers = false;
  @Input('highlightedLines') _highlightedLines: HighlightedLines = null;
  @Input() snippet: Snippet = null;

  get code(): string {
    if (this.snippet != null) { return this.snippet.code; }
    return this._code;
  }

  get lang(): string {
    if (this.snippet != null) { return this.snippet.language; }
    return this._lang;
  }

  get showLineNumbers(): boolean {
    if (this.snippet != null) { return this.snippet.showLineNumbers; }
    return this._showLineNumbers;
  }

  get highlightedLines(): HighlightedLines {
    if (this.snippet != null) { return this.snippet.highlightedLines; }
    return this._highlightedLines;
  }

  constructor(private _service: CodeHighlightService) { }

  get preClass() {
    return {
      [this.language]: true,
      'line-numbers': this.showLineNumbers,
    };
  }

  get language(): string {
    return `language-${this.lang}`;
  }

  ngAfterViewInit() {
    this._highlight();
  }

  private get highlightedLinesIndexes(): Set<number> {
    const indexes = new Set();

    if (this.highlightedLines == null) {
      // no index
    } else if (typeof this.highlightedLines === 'number') {
      indexes.add(this.highlightedLines);
    } else {
      this.highlightedLines.forEach(item => {
        if (typeof item === 'number') {
          indexes.add(item);
        } else {
          const [start, end] = item;
          for (let index = start; index <= end; index++) {
            indexes.add(index);
          }
        }
      });
    }

    return indexes;
  }

  private _highlight() {
    const element = this.codeEl.nativeElement;
    this._service.highlightElement(element);

    const indexes = Array.from(this.highlightedLinesIndexes);
    if (indexes.length !== 0) {
      const lines = element.innerHTML.split(/(?:\r\n)|\n|\r/gi);

      indexes.forEach(index => {
        const realIndex = index - 1;
        const line = lines[realIndex];
        lines[realIndex] = `<span class="highlighted-line">${line}</span>`;
      });

      element.innerHTML = lines.join('\n');
    }
  }
}
