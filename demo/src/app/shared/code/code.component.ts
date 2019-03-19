import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from '@angular/core';

import {CodeHighlightService} from './code-highlight.service';

@Component({
  selector: 'ngbd-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre
      [ngClass]="preClass"
      [attr.data-line]="highlightedLines"
    ><code
      #codeEl
      [ngClass]="language"
    >{{code.trim()}}</code></pre>
  `
})
export class NgbdCodeComponent implements AfterViewInit {

  @ViewChild('codeEl') codeEl: ElementRef<HTMLElement>;

  @Input() code = '';
  @Input() lang = '';
  @Input() showLineNumbers = false;
  @Input() highlightedLines: string = null;

  constructor(private _service: CodeHighlightService) { }

  get preClass() {
    return {
      [this.language]: true,
      'line-numbers': this.highlightedLines != null || this.showLineNumbers,
    };
  }

  get language(): string {
    return `language-${this.lang}`;
  }

  ngAfterViewInit() {
    // 2019-03-19T16:43:51+01:00 setTimeout ensures the line highlighting plugin
    // will work properly
    setTimeout(() => this._service.highlightElement(this.codeEl.nativeElement), 0);
  }
}
