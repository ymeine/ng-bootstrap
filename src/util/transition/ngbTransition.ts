import { Renderer2 } from '@angular/core';



interface TransitionContext {
  transitionCounter?: number;
  eventsUnlisteners: Array<Function>;

  promiseResolve?(data?: any);
}

export interface TransitionDefinition {
  classname?: string;
  beforeTransitionStart?(element: HTMLElement, options: TransitionOptions);
  afterTransitionStart?(element: HTMLElement, options: TransitionOptions): boolean;
  afterTransitionEnd?(element: HTMLElement, options: TransitionOptions);
}

export interface TransitionOptions {
  enableAnimation?: boolean;
  data?: any;
  callback?(data?: any);
}



export class Transition {
  direction?: 'show' | 'hide';

  private _contexts = new Map<any, TransitionContext>();

  constructor(
    public transitionDef: TransitionDefinition,
    private _renderer: Renderer2,
  ) {}

  show(element: HTMLElement, options: TransitionOptions = {}): Promise<any> {
    this.direction = 'show';
    return this._run(element, options);
  }

  hide(element: HTMLElement, options: TransitionOptions = {}): Promise<any> {
    this.direction = 'hide';
    return this._run(element, options);
  }

  reflow(element: HTMLElement) {
    return (element || document.body).offsetHeight;
  }

  private _run(element: HTMLElement, options: TransitionOptions) {
    return new Promise((resolve) => {
      const contexts = this._contexts;
      let context: TransitionContext;
      if (contexts.has(element)) {
        context = contexts.get(element);
      } else {
        context = {
          transitionCounter: 0,
          promiseResolve: resolve,
          eventsUnlisteners: [],
        };
        contexts.set(element, context);
      }

      const adding = this.direction === 'show';
      const renderer = this._renderer;
      const transitionDef = this.transitionDef;

      if (options.enableAnimation) {
        if (transitionDef.beforeTransitionStart != null) {
          transitionDef.beforeTransitionStart(element, options);
        }

        this.reflow(element);
        this._addEvents(element, options);
      }

      const {classname} = transitionDef;
      if (classname != null) {
        const ensureClassname = adding ? renderer.addClass : renderer.removeClass;
        ensureClassname.call(renderer, element, classname);
      }

      let endNow;
      if (!options.enableAnimation) {
        endNow = true;
      } else {
        endNow = false;
        this.reflow(element);

        if (transitionDef.afterTransitionStart) {
          endNow = transitionDef.afterTransitionStart(element, options) === false;
        }
      }

      if (endNow) {
        this._transitionEnd(element, options);
      }
    });
  }

  private _addEvents(element: HTMLElement, options: TransitionOptions) {
    const context = this._contexts.get(element);

    this._removeEvents(context);

    context.transitionCounter = 0;

    const renderer = this._renderer;
    context.eventsUnlisteners = [
      renderer.listen(
        element,
        'transitionstart',
        this._transitionStart.bind(this, element, options)
      ),
      renderer.listen(
        element,
        'transitionend',
        this._transitionEnd.bind(this, element, options)
      ),
    ];
  }

  private _removeEvents(context: TransitionContext) {
    context.eventsUnlisteners.forEach(unlisten => unlisten());
    context.eventsUnlisteners = [];
  }

  private _transitionStart(context: TransitionContext) {
    context.transitionCounter++;
  }

  private _transitionEnd(element: HTMLElement, options: TransitionOptions) {
    if (!this._contexts.has(element)) { return; }

    const context = this._contexts.get(element);
    console.log('on transition end, counter:', context.transitionCounter);
    context.transitionCounter--;
    const counter = context.transitionCounter;
    if (counter < 1) {
      this._removeEvents(context);
      this._contexts.delete(element);
      context.transitionCounter = 0;

      const transitionDef = this.transitionDef;

      let callbackParameters;
      if (transitionDef.afterTransitionEnd) {
        callbackParameters = transitionDef.afterTransitionEnd(element, options);
      }

      context.promiseResolve(callbackParameters);
    }
  }
}
