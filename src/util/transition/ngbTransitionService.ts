import { Injectable } from '@angular/core';

@Injectable()
export class NgbTransitionService {
  hooks = new Map<any, Function>();

  constructor() {}

  registerBeforeDestroyHook(element: any, hook: Function) {
    this.hooks.set(element, hook);
  }

  callHooksForElement(element: any): Promise<void> {
    const hooks = this._getSubtreeHooks(element);
    const promises = hooks.map(hook => hook());

    return Promise.all(promises)
      .then(() => this._unregisterOnDestroy(hooks));
  }

  /**
   *
   */
  private _getSubtreeHooks(root): Array<Function> {
    return Array.from(this.hooks.entries())
      .map(([element, hook]) => ({element, hook}))
      .filter(({element}) => root.contains(element))
      .map(({hook}) => hook);
  }

  /**
   *
   */
  private _unregisterOnDestroy(hooksToUnRegister: Array<Function>) {
    const {hooks} = this;
    hooks.forEach((hook, element) => {
      if (hooksToUnRegister.includes(hook)) {
        hooks.delete(element);
      }
    });
  }
}
