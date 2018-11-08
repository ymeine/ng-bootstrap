import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NgbdDemoList } from '../../shared';
import { NgbdOverview } from '../../shared/overview';
import { DefinedOperator } from '../../shared/overview/operators-reference';

@Component({
  selector: 'ngbd-typeahead-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './typeahead-overview.component.html',
  host: {
    '[class.overview]': 'true'
  }
})
export class NgbdTypeaheadOverviewComponent {
  sections: NgbdOverview = {};

  operators: DefinedOperator[] = [
    'tap',
    'switchMap',
    'debounceTime',
    'debounce',
    'timer',
    'distinctUntilChanged',
    'map',
    'catchError',
  ];

  constructor(demoList: NgbdDemoList) {
    this.sections = demoList.getOverviewSections('typeahead');
  }
}
