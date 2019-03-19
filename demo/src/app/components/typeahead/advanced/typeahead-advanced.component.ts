import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { SECTIONS_LIST } from './sections';

@Component({
  selector: 'ngbd-typeahead-advanced',
  templateUrl: './typeahead-advanced.component.html',
})
export class NgbdTypeaheadAdvancedComponent {
  sections = {};

  activePanelId: string;

  constructor(route: ActivatedRoute, private _router: Router) {
    SECTIONS_LIST.forEach(([fragment, title]) => this.sections[fragment] = {fragment, title});
    this.activePanelId = SECTIONS_LIST[0][0];

    route.fragment.subscribe(fragment => {
      this.activePanelId = fragment;
    });
  }

  onPanelChange({panelId}: NgbPanelChangeEvent) {
    this._router.navigate([], {fragment: panelId});
  }
}
