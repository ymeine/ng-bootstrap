import {
  Component, ViewChild,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  customDebounce,
  times,
} from '../../common';

interface Option {
  label: string;
  value: number;
}



@Component({
  selector: 'ngbd-typeahead-overview-section-display-customization',
  templateUrl: './template.html',
})
export class NgbdTypeaheadOverviewSectionDisplayCustomizationComponent {
 @ViewChild('displayResult') displayResultTemplate;

  model: string;
  debounceTime = 200;

  useTemplate = true;

  initializeTypeahead = (text$: Observable<string>): Observable<Option[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(term => term === '' ? [] : times(5, value => ({
      label: term.repeat(value + 1),
      value: value + 1,
    }))),
  )

  formatForInput(option: Option): string {
    return option.label.toUpperCase();
  }

  formatForOptionsList(option: Option): string {
    return option.label.toUpperCase();
  }

  get resultTemplate() {
    return this.useTemplate ? this.displayResultTemplate : null;
  }

  get resultFormatter() {
    return !this.useTemplate ? this.formatForOptionsList.bind(this) : null;
  }
}
