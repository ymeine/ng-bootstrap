import {
  Component,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  customDebounce,
  STYLES,
  MATRIX_STYLE,
  getResults,
} from '../../common';

import {SNIPPETS} from './snippets';



@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-basic',
  templateUrl: './template.html',
  styles: [STYLES, MATRIX_STYLE]
})
export class NgbdTypeaheadOverviewSectionUseCaseBasicComponent {
  model: string;
  debounceTime : number;

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
