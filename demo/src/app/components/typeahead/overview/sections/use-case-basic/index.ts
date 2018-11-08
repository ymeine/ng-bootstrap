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
  generateResults,
  customDebounce,
} from '../../common';



@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-basic',
  templateUrl: './template.html',
})
export class NgbdTypeaheadOverviewSectionUseCaseBasicComponent {
  model: string;
  debounceTime = 200;

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(generateResults),
  )
}
