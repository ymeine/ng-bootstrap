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
  STYLES,
  Color,
  FULL_COLORS as COLORS,
} from '../../common';

import { SNIPPETS } from './snippets';



@Component({
  selector: 'ngbd-typeahead-overview-section-display-customization',
  templateUrl: './template.html',
  styles: [
    STYLES,
    `
    .middle > * {
      vertical-align: middle;
    }

    .color-chip {
      display: inline-block;
      height: 1em;
      width: 1em;
      border-radius: 0.5em;
      border: solid black 1px;
      margin-right: 0.30em;
      margin-top: 2px;
    }
    `
  ]
})
export class NgbdTypeaheadOverviewSectionDisplayCustomizationComponent {
  @ViewChild('displayResult') displayResultTemplate;

  model: string;
  debounceTime: number;

  formatUpperCase: boolean;
  resultTransformationType: 'formatter' | 'template';

  snippets = SNIPPETS;

  constructor() {
    this.reset();
  }

  initializeTypeahead = (text$: Observable<string>): Observable<Color[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(term => term === '' ? COLORS : COLORS.filter(color => color.name.toLowerCase().startsWith(term.toLowerCase()))),
  )

  formatForInput(color: Color): string {
    let output = color.name;
    if (this.formatUpperCase) {
      output = output.toUpperCase();
    }
    return output;
  }

  formatForOptionsList(color: Color): string {
    return `${color.name} (${color.hexCode})`;
  }

  get resultTemplate() {
    return this.resultTransformationType === 'template' ? this.displayResultTemplate : null;
  }

  get resultFormatter() {
    return this.resultTransformationType === 'formatter' ? this.formatForOptionsList.bind(this) : null;
  }

  get inputFormatter() {
    return this.formatForInput.bind(this);
  }

  reset() {
    this.model = '';
    this.debounceTime = 200;

    this.formatUpperCase = true;
    this.resultTransformationType = 'template';
  }
}
