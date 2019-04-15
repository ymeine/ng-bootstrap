import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from '@angular/core';

import {ISnippet} from './snippet';
import {CodeHighlightService} from './code-highlight.service';

@Component({
  selector: 'ngbd-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre
      [ngClass]="preClass"
    ><code
      #codeEl
      [ngClass]="language"
    >{{snippet.code.trim()}}</code></pre>
  `,
})
export class NgbdCodeComponent implements AfterViewInit {
  @ViewChild('codeEl') codeEl: ElementRef<HTMLElement>;

  @Input() snippet: ISnippet = null;

  constructor(private _service: CodeHighlightService) { }

  get preClass() {
    return {
      [this.language]: true,
      'line-numbers': this.snippet.showLineNumbers,
    };
  }

  get language(): string { return `language-${this.snippet.lang}`; }

  ngAfterViewInit() { this._highlight(); }

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

  private get highlightedLinesIndexes(): Set<number> {
    const {highlightedLines} = this.snippet;
    const indexes = new Set();

    if (highlightedLines == null) {
      // no index
    } else if (typeof highlightedLines === 'number') {
      indexes.add(highlightedLines);
    } else {
      highlightedLines.forEach(item => {
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
}
