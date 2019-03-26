import {
  Component,
  Input,
  ViewChild,
} from '@angular/core';

import {SearchSource} from './model';

import {SNIPPETS} from './snippets';
import {STYLES} from '../../../advanced/common';



@Component({
  selector: 'ngbd-typeahead-demos2-events',
  templateUrl: './component.html',
  styles: [STYLES],
})
export class NgbdTypeaheadDemos2EventsComponent {
  @Input() section;
  snippets = SNIPPETS;

  model: string;
  debounceTime = 200;

  opensOnFocus = true;
  opensOnClick = true;
  simulatesSearchDelay = true;

  searchSource: null | SearchSource;

  @ViewChild('demo') demo;

  constructor() {
    this.resetOptions();
  }

  resetDemo = () => {
    this.model = null;

    this.resetOptions();
    this.resetState();
  }

  resetOptions() {
    this.opensOnFocus = true;
    this.opensOnClick = true;
    this.simulatesSearchDelay = true;
    this.debounceTime = 200;
  }

  resetState() {
    this.searchSource = null;
  }

  search(term: string) {
    this.demo.search(term);
  }
}
