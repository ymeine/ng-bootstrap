import {
  Component,
} from '@angular/core';

import {
  MATRIX_STYLE,
} from '../../common';

import {SNIPPETS} from './snippets';



@Component({
  selector: 'ngbd-typeahead-overview-section-observable-contract',
  templateUrl: './template.html',
  styles: [MATRIX_STYLE]
})
export class NgbdTypeaheadOverviewSectionContractComponent {
  snippets = SNIPPETS;
}
