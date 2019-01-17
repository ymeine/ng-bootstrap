import {
  Component,
  Input,
  ViewChild,
} from '@angular/core';

import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

import {
  OperatorReference,
  DefinedOperator,
  DisplayableLink,
} from './models';

import { operators } from './data';

@Component({
  selector: 'ngbd-overview-operator-popup',
  templateUrl: './popup.template.html',
  styles: [`
    .text {
      border-bottom: 1px dotted black;
      cursor: pointer;
    }

    .popup-container {
      margin-top: 1em;
      margin-right: 2em;
    }
  `],
})
export class NgbdOverviewOperatorPopupComponent {
  @Input() name: DefinedOperator;

  @ViewChild('popover') popover: NgbPopover;

  get operator(): OperatorReference { return operators[this.name]; }
  get links(): DisplayableLink[] { return this.operator.links; }

  get textTooltip(): string | null {
    return this.popover.isOpen()
      ? null
      : 'Click to see links to documentations';
  }

  openPopup() { this.popover.open(); }
}
