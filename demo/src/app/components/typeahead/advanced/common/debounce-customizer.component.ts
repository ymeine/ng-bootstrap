import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';



@Component({
  selector: 'ngbd-typeahead-common-debounce-customizer',
  template: `
    <div class="form-group form-inline">
      <label>debounce time:&nbsp;</label>
      <input
        type="number"
        class="form-control"
        [ngModel]="value"
        (ngModelChange)="valueChange.next($event)"
        step='100'
        min='0'
        max='2000'
      />
    </div>
  `,
})
export class NgbdTypeaheadCommonDebounceCustomizerComponent {
  @Input() value: number;
  @Output() valueChange = new EventEmitter<number>();
}
