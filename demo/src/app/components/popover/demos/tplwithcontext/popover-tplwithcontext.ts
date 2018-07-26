import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {Component, ViewChild} from '@angular/core';

@Component({
  selector: 'ngbd-popover-tplwithcontext',
  templateUrl: './popover-tplwithcontext.html'
})
export class NgbdPopoverTplwithcontext {
  greeting: string;
  name = 'World';

  @ViewChild('p') public popover: NgbPopover;

  public changeGreeting(greeting: string): void {
    const isOpen = this.popover.isOpen();
    this.popover.close();
    if (greeting !== this.greeting || !isOpen) {
      this.greeting = greeting;
      this.popover.open({greeting});
    }
  }
}
