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
  COLORS,
} from '../../common';

import {SNIPPETS} from './snippets';



@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-basic',
  templateUrl: './template.html',
  styles: [
    STYLES,
  ]
})
export class NgbdTypeaheadOverviewSectionUseCaseBasicComponent {
  model: string;
  debounceTime = 200;

  snippets = SNIPPETS;

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(pattern => pattern.length === 0
      ? COLORS
      : COLORS.filter(color => color.startsWith(pattern))
    ),
  )
}
