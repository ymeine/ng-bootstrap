import {NgModule, ModuleWithProviders} from '@angular/core';

import {NgbPopover, NgbPopoverWindow, NgbPopoverToggle} from './popover';

export {NgbPopover} from './popover';
export {NgbPopoverConfig} from './popover-config';
export {Placement} from '../util/positioning';

@NgModule({
  declarations: [NgbPopover, NgbPopoverWindow, NgbPopoverToggle],
  exports: [NgbPopover, NgbPopoverToggle],
  entryComponents: [NgbPopoverWindow]
})
export class NgbPopoverModule {
  /**
   * Importing with '.forRoot()' is no longer necessary, you can simply import the module.
   * Will be removed in 4.0.0.
   *
   * @deprecated 3.0.0
   */
  static forRoot(): ModuleWithProviders { return {ngModule: NgbPopoverModule}; }
}
