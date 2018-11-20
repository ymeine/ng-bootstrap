import {
  Component,
  Input,
} from '@angular/core';

import {
  OperatorReference,
  DefinedOperator,
} from './models';

import { operators } from './data';

@Component({
  selector: 'ngbd-overview-operators-reference',
  templateUrl: './template.html',
  styles: [
    `.clickable {
      cursor: pointer;
    }
    .collapse-handle {
      font-family: monospace;
      cursor: pointer;
    }
    .fitting-cell {
      width: 1px;
      white-space: nowrap;
    }
    `
  ],
})
export class NgbdOverviewOperatorsReferenceComponent {
  @Input() operators: DefinedOperator[] = [];

  websitesListCollapsed = false;

  get operatorsList(): OperatorReference[] {
    return this.operators
    .map(name => operators[name])
    .filter(value => value != null)
    ;
  }

  toggleWebsitesListCollapsed() {
    this.websitesListCollapsed = !this.websitesListCollapsed;
  }
}
