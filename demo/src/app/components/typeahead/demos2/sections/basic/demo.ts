import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  customDebounce,
  getResults,
} from '../../../advanced/common';



@Component({
  selector: 'ngbd-typeahead-demos2-basic-demo',
  templateUrl: './demo.html',
})
export class NgbdTypeaheadDemos2BasicDemoComponent {
  @Input('model') modelValue: string = null;
  @Output() modelChange = new EventEmitter<string>();

  @Input() debounceTime: number;

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    customDebounce(() => this.debounceTime),
    map(getResults),
  )
}
