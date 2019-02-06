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
  getResults,
} from '../../common';

import { SNIPPETS } from './snippets';



interface Option {
  label: string;
  value: string;
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

  snippets = SNIPPETS;

  initializeTypeahead = (text$: Observable<string>): Observable<Option[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(term => getResults(term).map(color => ({
        label: `color: ${color}`,
        value: color,
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
