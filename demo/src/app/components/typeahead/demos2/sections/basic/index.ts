import {
  Component,
  Input,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  customDebounce,
  getResults,
  STYLES,
} from '../../../advanced/common';

import {SNIPPETS} from './snippets';



@Component({
  selector: 'ngbd-typeahead-demos2-basic',
  templateUrl: './template.html',
  styles: [
    STYLES,
  ]
})
export class NgbdTypeaheadDemos2BasicComponent {
  @Input() section;

  model: string;
  debounceTime: number;

  snippets = SNIPPETS;

  constructor() {
    this.reset();
  }

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(getResults),
  )

  reset() {
    this.model = '';
    this.debounceTime = 200;
  }
}
