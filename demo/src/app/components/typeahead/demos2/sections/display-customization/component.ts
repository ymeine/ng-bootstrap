import {
  Component,
  Input,
} from '@angular/core';

import {
  STYLES,
  Color,
} from '../../../advanced/common';

import { SNIPPETS } from './snippets';



@Component({
  selector: 'ngbd-typeahead-demos2-display-customization',
  templateUrl: './component.html',
  styles: [
    STYLES,
  ]
})
export class NgbdTypeaheadDemos2DisplayCustomizationComponent {
  @Input() section;

  snippets = SNIPPETS;

  model: Color = null;
  debounceTime: number;

  formatUpperCase: boolean;
  resultTransformationType: 'formatter' | 'template';

  constructor() {
    this.resetOptions();
  }

  resetDemo = () => {
    this.model = null;

    this.resetOptions();
  }

  resetOptions() {
    this.debounceTime = 200;

    this.formatUpperCase = true;
    this.resultTransformationType = 'template';
  }
}
