import { Component, Input } from '@angular/core';

import { OperatorReference, DefinedOperator } from './models';
import { operators } from './data';

@Component({
  selector: 'ngbd-overview-operators-reference',
  templateUrl: './template.html',
})
export class NgbdOverviewOperatorsReferenceComponent {
  @Input() operators: DefinedOperator[] = [];

  operatorsMap = operators;

  get operatorsList(): OperatorReference[] {
    return this.operators
    .map(name => operators[name])
    .filter(value => value != null)
    ;
  }
}
