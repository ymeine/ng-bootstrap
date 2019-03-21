import { SECTIONS_LIST } from './sections';
import { Component } from '@angular/core';

@Component({
  selector: 'ngbd-typeahead-demos2',
  templateUrl: './typeahead-demos2.component.html',
})
export class NgbdTypeaheadDemos2Component {
  sections = {};

  constructor() {
    SECTIONS_LIST.forEach(([fragment, title]) => this.sections[fragment] = {fragment, title});
  }
}
