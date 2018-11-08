import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';



@Component({
  selector: 'ngbd-typeahead-overview-common-checkbox',
  template: `
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        [ngModel]="value"
        (ngModelChange)="valueChange.next($event)"
        id="{{fullId}}"
      />
      <label
        class="form-check-label"
        for="{{fullId}}"
      >
        {{label}}
      </label>
    </div>
  `,
})
export class NgbdTypeaheadOverviewCommonCheckboxComponent {
  @Input() id: string;
  @Input() label: string;

  @Input() value: boolean;
  @Output() valueChange = new EventEmitter<boolean>();

  get fullId(): string {
    return `'typeahead-overview-'${this.id}`;
  }
}
