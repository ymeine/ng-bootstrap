import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {Component, ViewChild} from '@angular/core';

@Component({
  selector: 'ngbd-tooltip-tplwithcontext',
  templateUrl: './tooltip-tplwithcontext.html'
})
export class NgbdTooltipTplwithcontext {
  greeting: string;
  name = 'World';

  @ViewChild('t') public tooltip: NgbTooltip;

  public changeGreeting(greeting: string): void {
    const isOpen = this.tooltip.isOpen();
    this.tooltip.close();
    if (greeting !== this.greeting || !isOpen) {
      this.greeting = greeting;
      this.tooltip.open({greeting});
    }
  }
}
