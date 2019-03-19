import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';



@Component({
  selector: 'ngbd-typeahead-common-checkbox',
  template: `
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        [ngModel]="value"
        (ngModelChange)="valueChange.next($event)"
        [ngModelOptions]="{standalone: true}"
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
export class NgbdTypeaheadCommonCheckboxComponent {
  @Input() id: string;
  @Input() label: string;

  @Input() value: boolean;
  @Output() valueChange = new EventEmitter<boolean>();

  get fullId(): string {
    return `typeahead-overview-${this.id}`;
  }
}
