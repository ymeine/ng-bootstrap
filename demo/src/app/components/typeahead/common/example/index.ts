import {Component, Input, TemplateRef} from '@angular/core';

import {STYLES} from '../../advanced/common';

import {STYLE} from './style';



@Component({
  selector: 'ngbd-example2',
  templateUrl: './template.html',
  styles: [
    STYLES,
    STYLE,
  ],
})
export class NgbdExample2 {
  @Input() section;
  @Input('explanations-fragment') explanationsFragment: string;

  @Input('snippet-component') snippetComponent;
  @Input('snippet-template') snippetTemplate;
  @Input('snippet-data') snippetData;

  @Input() resetDemo: Function;

  @Input() instance: TemplateRef<void>;
  @Input() instructions: TemplateRef<void>;
  @Input() options: TemplateRef<void>;
  @Input() code: TemplateRef<void>;
  @Input() state: TemplateRef<void>;
  @Input() actions: TemplateRef<void>;

  snippet = 'component';
}
