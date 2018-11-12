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
    .collapseHandle {
      font-family: monospace;
      cursor: pointer;
    }`
  ],
})
export class NgbdOverviewOperatorsReferenceComponent {
  @Input() operators: DefinedOperator[] = [];

  websitesListCollapsed = false;

  operatorsMap = operators;

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
