import { Injectable, Renderer2 } from '@angular/core';

@Injectable()
export class NgbTransitionService {

  onDestroyPromises = new Map<any, Function>();

  constructor() {}

  onDestroy(element: any, fn: Function) {
    // this._renderer.data.onDestroy(element, fn);
    this.onDestroyPromises.set(element, fn);
  }


  resolvePromiseForElement(element: any): Promise<void> {
    const onDestroyFns = this._getOnDestroyPromises(element);
    const length = onDestroyFns.length;

    const promises = [];
    for (let i = 0; i < length; i++) {
      const promiseFactory = onDestroyFns[i];
      const promise = promiseFactory();
      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      this._unregisterOnDestroy(promises);
    });

  }

  /**
   * Get all onDestroy contained in the provided element
   */
  private _getOnDestroyPromises(element): Array<Function> {
    const onDestroy: Array<Function> = [];
    this.onDestroyPromises.forEach((promiseFn, pElement) => {
      if (this._inDom(element, pElement)) {
        onDestroy.push(promiseFn);
      }
    });

    return onDestroy;
  }

  /**
   * Unregister the promises given
   */
  private _unregisterOnDestroy(promises: Array<Function>) {
    const onDestroyPromises = this.onDestroyPromises;
    onDestroyPromises.forEach((promiseFn, pElement) => {
      if (promises.indexOf(promiseFn) > -1) {
        onDestroyPromises.delete(pElement);
      }
    });
  }

  /**
   *
   * @param container Return true if element is a child of parent
   * @param element
   */
  private _inDom(container, element) {
    let current = element;
    while (current && current !== document.body) {
      if (current === container) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }


}

