import {
  Component,
  ViewChild,
} from '@angular/core';

import {
  Observable,
  Subject,
  merge,
} from 'rxjs';

import {
  map,
  filter,
} from 'rxjs/operators';

import {
  NgbTypeahead,
} from '@ng-bootstrap/ng-bootstrap';

import {
  generateResults,
  customDebounce,
} from '../../common';



@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-focus',
  templateUrl: './template.html',
})
export class NgbdTypeaheadOverviewSectionUseCaseFocusComponent {
  model: string;
  debounceTime = 200;

  openOnFocus = true;
  openOnClick = true;

  @ViewChild('instance') instance: NgbTypeahead;
  inputFocus$ = new Subject<string>();
  inputClick$ = new Subject<string>();

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => {
    const debouncedText$ = text$.pipe(
      customDebounce(() => this.debounceTime),
    );

    const clickWhenPopupClosed$ = this.inputClick$.pipe(
      filter(() => this.openOnClick),
      filter(() => !this.instance.isPopupOpen()),
    );

    const inputFocus$ = this.inputFocus$.pipe(
      filter(() => this.openOnFocus),
    );

    const searchSources = [
      debouncedText$,
      clickWhenPopupClosed$,
      inputFocus$,
    ];

    return merge(...searchSources).pipe(
      map(term => term === '' ? ['<empty>'] : generateResults(term)),
    );
  }
}
