import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgbAlert} from './alert';
import {NgbAlertConfig} from './alert-config';
import {NgbTransitionModule} from '../util/transition/transition.module';

export {NgbAlert} from './alert';
export {NgbAlertConfig} from './alert-config';

@NgModule({
  declarations: [NgbAlert],
  exports: [NgbAlert],
  imports: [CommonModule, NgbTransitionModule],
  entryComponents: [NgbAlert]
})
export class NgbAlertModule {
  /**
   * Importing with '.forRoot()' is no longer necessary, you can simply import the module.
   * Will be removed in 4.0.0.
   *
   * @deprecated 3.0.0
   */
  static forRoot(): ModuleWithProviders { return {ngModule: NgbAlertModule}; }
}
