import { Component } from '@angular/core';

import { SNIPPETS } from './snippets';



@Component({
  selector: 'ngbd-typeahead-overview-section-display-customization',
  templateUrl: './template.html',
})
export class NgbdTypeaheadOverviewSectionDisplayCustomizationComponent {
  snippets = SNIPPETS;
}
