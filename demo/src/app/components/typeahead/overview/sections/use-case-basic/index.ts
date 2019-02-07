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
  getResults,
} from '../../common';

import {SNIPPETS} from './snippets';



@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-basic',
  templateUrl: './template.html',
  styles: [
    STYLES,
    `
    table.matrix {
      margin: 2em auto;
    }

    table.matrix th, table.matrix td {
      padding: 0.5em;
    }

    table.matrix tbody th {
      text-align: right;
    }

    table.matrix td {
      text-align: center;
    }

    table.matrix thead th {
      border-bottom: 1px solid black;
      text-align: center;
      vertical-align: top;
    }

    table.matrix tbody th {
      text-align: left;
    }

    table.matrix tbody th,
    table.matrix thead th:nth-child(1),
    table.matrix tr > *:nth-child(2) {
      border-right: 1px solid black;
    }

    table.matrix thead th:nth-child(1) {
      position: relative;
      width: 10em;
      height: 3.5em;
    }
    table.matrix thead th:nth-child(1) .left {
      display: inline-block;
      position: absolute;
      bottom: 0.5em;
      left: 0.5em;
    }
    table.matrix thead th:nth-child(1) .separator {
      background-image: linear-gradient(to top right, transparent 49%, black, transparent 51%);
      display: inline-block;
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      top: 30%;
    }
    table.matrix thead th:nth-child(1) .right {
      display: inline-block;
      position: absolute;
      top: 0.5em;
      right: 0.5em;
    }
    `
  ]
})
export class NgbdTypeaheadOverviewSectionUseCaseBasicComponent {
  model: string;
  debounceTime = 200;

  snippets = SNIPPETS;

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(getResults),
  )
}
