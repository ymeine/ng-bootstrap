import {Injectable, RendererFactory2, OnDestroy} from '@angular/core';

import {isDefined} from './util';



////////////////////////////////////////////////////////////////////////////////
// Types: subscription
////////////////////////////////////////////////////////////////////////////////

export interface CallbackPayload { event: Event; }

export interface SubscriptionSpec {
  keyEvent?: 'keyup' | 'keydown';
  mouseEvent?: 'mouseup' | 'mousedown';

  shouldAutoClose?(): boolean;
  shouldCloseOnEscape?(payload: CallbackPayload): boolean;
  shouldCloseOnClickOutside?(payload: CallbackPayload): boolean;
  shouldCloseOnClickInside?(payload: CallbackPayload): boolean;

  isTargetTogglingElement?(target: HTMLElement): boolean;
  isTargetInside?(target: HTMLElement): boolean;

  close(event: Event, payload: {reason: 'escape' | 'outside_click' | 'inside_click', eventType: string});
}

// For TypeScript 2.8
// export type SubscriptionInstance = {
//   { +readonly [P in keyof SubscriptionSpec]-?: SubscriptionSpec[P] };
// }
export interface SubscriptionInstance {
  readonly keyEvent: SubscriptionSpec['keyEvent'], readonly mouseEvent: SubscriptionSpec['mouseEvent'],

      readonly shouldAutoClose: SubscriptionSpec['shouldAutoClose'],
      readonly shouldCloseOnEscape: SubscriptionSpec['shouldCloseOnEscape'],
      readonly shouldCloseOnClickOutside: SubscriptionSpec['shouldCloseOnClickOutside'],
      readonly shouldCloseOnClickInside: SubscriptionSpec['shouldCloseOnClickInside'],

      readonly isTargetTogglingElement: SubscriptionSpec['isTargetTogglingElement'],
      readonly isTargetInside: SubscriptionSpec['isTargetInside'],

      readonly close: SubscriptionSpec['close']
}

export type Subscription = Function;



////////////////////////////////////////////////////////////////////////////////
// Types: subscriber
////////////////////////////////////////////////////////////////////////////////

export type Subscriber = {
  (): void; toggle: () => void; subscribe: () => void; unsubscribe: () => void;
};



////////////////////////////////////////////////////////////////////////////////
// Types: high-level api
////////////////////////////////////////////////////////////////////////////////

export type AutoCloseMode = 'inside' | 'outside';
export type AutoCloseType = boolean | AutoCloseMode;

export interface SubscriptionSpecFactorySpec {
  keyEvent?: SubscriptionSpec['keyEvent'];
  mouseEvent?: SubscriptionSpec['mouseEvent'];
  close: SubscriptionSpec['close'];

  getAutoClose: () => AutoCloseType;
  getElementsInside: () => HTMLElement[];
  getTogglingElement?: () => HTMLElement;
}



////////////////////////////////////////////////////////////////////////////////
// Service
////////////////////////////////////////////////////////////////////////////////

@Injectable()
export class AutoCloseService implements OnDestroy {
  ////////////////////////////////////////////////////////////////////////////
  // Events listening
  ////////////////////////////////////////////////////////////////////////////

  private listenersSubscriptions: Function[];

  constructor(rendererFactory: RendererFactory2) {
    const renderer = rendererFactory.createRenderer(null, null);

    this.listenersSubscriptions = [
      ['click', 'onClickEvent'], ['mousedown', 'onMouseEvent'], ['mouseup', 'onMouseEvent'], ['keydown', 'onKeyEvent'],
      ['keyup', 'onKeyEvent']
    ].map(([type, handler]) => renderer.listen('document', type, event => this[handler](event, type)));
  }

  ngOnDestroy() { this.listenersSubscriptions.forEach(subscription => subscription()); }



  ////////////////////////////////////////////////////////////////////////////
  // Subscriptions management
  ////////////////////////////////////////////////////////////////////////////

  // tslint:disable-next-line:member-ordering
  private subscriptions: SubscriptionSpec[] = [];

  public subscribe(subscriptionSpec: SubscriptionSpec): Subscription {
    const {subscriptions} = this;

    if (!subscriptions.includes(subscriptionSpec)) {
      subscriptions.unshift(subscriptionSpec);
    }

    return () => this.unsubscribe(subscriptionSpec);
  }

  private unsubscribe(subscriptionSpec: SubscriptionSpec) {
    this.subscriptions = this.subscriptions.filter(item => item !== subscriptionSpec);
  }

  private normalizeSubscription(subscriptionSpec: SubscriptionSpec): SubscriptionInstance {
    return {
      keyEvent: this.withDefault(subscriptionSpec.keyEvent, 'keyup'),
      mouseEvent: this.withDefault(subscriptionSpec.mouseEvent, 'mousedown'),

      shouldAutoClose: this.withDefault(subscriptionSpec.shouldAutoClose, () => true),
      shouldCloseOnEscape: this.withDefault(subscriptionSpec.shouldCloseOnEscape, () => true),

      shouldCloseOnClickOutside: this.withDefault(subscriptionSpec.shouldCloseOnClickOutside, () => true),
      shouldCloseOnClickInside: this.withDefault(subscriptionSpec.shouldCloseOnClickInside, () => false),

      isTargetTogglingElement: this.withDefault(subscriptionSpec.isTargetTogglingElement, () => false),
      isTargetInside: subscriptionSpec.isTargetInside,
      close: subscriptionSpec.close
    };
  }

  public createSubscriber(subscriptionSpec: SubscriptionSpec): Subscriber {
    let subscription: Subscription = null;

    const subscriptionInstance = this.normalizeSubscription(subscriptionSpec);

    const isSubscribed = () => isDefined(subscription);
    const _subscribe = () => subscription = this.subscribe(subscriptionInstance);
    const _unsubscribe = () => (subscription(), subscription = null);
    const _toggle = () => !isSubscribed() ? _subscribe() : _unsubscribe();

    const subscriber: any = () => _toggle();
    subscriber.toggle = _toggle;
    subscriber.subscribe = () => {
      if (!isSubscribed()) {
        _subscribe();
      }
    };
    subscriber.unsubscribe = () => {
      if (isSubscribed()) {
        _unsubscribe();
      }
    };

    return subscriber;
  }



  ////////////////////////////////////////////////////////////////////////////
  // Event handling
  ////////////////////////////////////////////////////////////////////////////

  // tslint:disable-next-line:member-ordering
  private _subscriptionExecuted: boolean;

  // A few notes:
  // - we handle the left click only
  // - the click event comes last among mouse events of a same user action, so:
  //   - it's no time to reset the `_subscriptionExecuted` flag anyways
  //   - there's no need to update this flag at the end since there's no further event
  // - if during a same user action a subscription already got called, we skip processing until next user action
  private onClickEvent(event: MouseEvent, eventType: string) {
    if (event.button !== 0 || this._subscriptionExecuted) {
      return;
    }

    this.arraySome(this.subscriptions, ({shouldAutoClose, shouldCloseOnClickInside, isTargetInside, close}) => {
      // note: if we can't determine if target is inside (i.e. `isTargetInside` is not defined):
      // - we won't call subscriptions here
      // - anyways the subscriptions would have been called in previous mouse events then
      // note: we call filters in an order so that potentially more costly processing occurs less probably
      if (isDefined(isTargetInside) && shouldAutoClose() && shouldCloseOnClickInside({event}) &&
          isTargetInside(<HTMLElement>event.target)) {
        close(event, {reason: 'inside_click', eventType});
        return true;
      }

      return false;
    });
  }

  // A few notes:
  // - we handle the left click only
  // - for one user action, the first mouse event is `mousedown` so it's a good time to reset the
  // `_subscriptionExecuted` flag
  // - if during a same user action a subscription already got called, we skip processing until next user action
  private onMouseEvent(event: MouseEvent, eventType: string) {
    if (event.button !== 0) {
      return;
    }

    if (eventType === 'mousedown') {
      this._subscriptionExecuted = null;
    } else if (this._subscriptionExecuted) {
      return;
    }

    const oneExecuted = this.arraySome(this.subscriptions, (subscription) => {
      let {mouseEvent, shouldAutoClose, shouldCloseOnClickOutside, isTargetTogglingElement, isTargetInside, close} =
          subscription;
      const target = <HTMLElement>event.target;

      // note: `shouldCloseOnClickOutside` makes no sense if we can't check if
      // target is inside/outside (i.e. if `isTargetInside` is not defined)
      if (mouseEvent === eventType && shouldAutoClose() && !isTargetTogglingElement(target) &&
          (!isDefined(isTargetInside) || (!isTargetInside(target) && shouldCloseOnClickOutside({event})))) {
        close(event, {reason: 'outside_click', eventType});
        return true;
      }
      return false;
    });

    if (this._subscriptionExecuted !== true) {
      this._subscriptionExecuted = oneExecuted;
    }
  }

  // A few notes:
  // - we handle the `escape` key only
  // - for one user action, the first keyboard event is `keydown` so it's a good time to reset the
  // `_subscriptionExecuted` flag
  // - if during a same user action a subscription already got called, we skip processing until next user action
  private onKeyEvent(event: KeyboardEvent, eventType: string) {
    if (!['Escape', 'Esc'].includes(event.key)) {
      return;
    }

    if (eventType === 'keydown') {
      this._subscriptionExecuted = null;
    } else if (this._subscriptionExecuted) {
      return;
    }

    const oneExecuted =
        this.arraySome(this.subscriptions, ({keyEvent, shouldAutoClose, shouldCloseOnEscape, close}) => {
          if (keyEvent === eventType && shouldAutoClose() && shouldCloseOnEscape({event})) {
            close(event, {reason: 'escape', eventType});
            return true;
          }
          return false;
        });

    if (this._subscriptionExecuted !== true) {
      this._subscriptionExecuted = oneExecuted;
    }
  }



  ////////////////////////////////////////////////////////////////////////////
  // High-level API
  ////////////////////////////////////////////////////////////////////////////

  public subscriptionSpecFactory(arg: SubscriptionSpecFactorySpec): SubscriptionSpec {
    let {keyEvent, mouseEvent, close, getAutoClose, getElementsInside, getTogglingElement} = arg;

    if (!isDefined(getAutoClose)) {
      getAutoClose = () => false;
    }

    const autoCloseIsTrueOr = (alternative: AutoCloseMode) => () => {
      const autoClose = getAutoClose();
      return !!(autoClose === true || autoClose === alternative);
    };

    const shouldAutoClose = () => {
      const autoClose = getAutoClose();
      return autoClose === true || autoClose === 'inside' || autoClose === 'outside';
    };

    return {
      close,
      keyEvent,
      mouseEvent,

      isTargetInside: !isDefined(getElementsInside) ?
          () => false :
          target => {
            const elements = getElementsInside();
            return !isDefined(elements) ? false : this.arraySome(
                                                      elements, element => this.safeElementContains(element, target));
          },
      isTargetTogglingElement:
          !isDefined(getTogglingElement) ? () => false : (target: HTMLElement) =>
                                                             this.safeElementContains(getTogglingElement(), target),

      shouldAutoClose,
      shouldCloseOnEscape: shouldAutoClose,
      shouldCloseOnClickInside: autoCloseIsTrueOr('inside'),
      shouldCloseOnClickOutside: autoCloseIsTrueOr('outside')
    };
  }



  ////////////////////////////////////////////////////////////////////////////
  // Utilities
  ////////////////////////////////////////////////////////////////////////////

  private arraySome<T>(array: T[], predicate: (item: T, index: number, array: T[]) => boolean): boolean {
    return array.findIndex(predicate) !== -1;
  }

  private safeElementContains(element?: HTMLElement, descendant?: HTMLElement): boolean {
    return (!isDefined(element) || !isDefined(descendant)) ? false : element.contains(descendant);
  }

  private withDefault<T>(value: T, defaultValue: T): T { return isDefined(value) ? value : defaultValue; }
}
