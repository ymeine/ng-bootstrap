import {
  Component,
  Input,
} from '@angular/core';

import {
  STYLES,
} from '../../../advanced/common';

import {SNIPPETS} from './snippets';



@Component({
  selector: 'ngbd-typeahead-demos2-basic',
  templateUrl: './component.html',
  styles: [STYLES],
})
export class NgbdTypeaheadDemos2BasicComponent {
  @Input() section;
  snippets = SNIPPETS;

  model: string = null;
  debounceTime: number;

  constructor() {
    this.resetOptions();
  }

  resetDemo = () => {
    this.model = null;
    this.resetOptions();
  }

  resetOptions() {
    this.debounceTime = 200;
  }
}
