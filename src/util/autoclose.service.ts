import {Injectable, RendererFactory2, OnDestroy} from '@angular/core';

import {isDefined} from './util';



////////////////////////////////////////////////////////////////////////////////
// Types: subscription
////////////////////////////////////////////////////////////////////////////////

export interface CallbackPayload { event: Event; }

export interface SubscriptionSpec {
  keyEvent?: 'keyup' | 'keydown';
  mouseEvent?: 'mouseup' | 'mousedown';

  shouldAutoClose(): boolean;
  shouldCloseOnEscape(payload: CallbackPayload): boolean;
  shouldCloseOnClickOutside(payload: CallbackPayload): boolean;
  shouldCloseOnClickInside(payload: CallbackPayload): boolean;

  isTargetTogglingElement?(target: HTMLElement): boolean;
  isTargetInside(target: HTMLElement): boolean;

  close(event: Event, payload: {reason: 'escape' | 'outside_click' | 'inside_click', eventType: string});
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
;



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

  public createSubscriber(subscriptionSpec: SubscriptionSpec): Subscriber {
    let subscription: Subscription = null;

    const isSubscribed = () => isDefined(subscription);
    const _subscribe = () => subscription = this.subscribe(subscriptionSpec);
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

  private onClickEvent(event: MouseEvent, eventType: string) {
    // we handle left-click mouse events only
    if (event.button !== 0) {
      return;
    }

    // during the same user action a subscription already got called, so we skip processing until next user action
    if (this._subscriptionExecuted) {
      return;
    }

    const oneExecuted =
        this.arraySome(this.subscriptions, ({shouldAutoClose, shouldCloseOnClickInside, isTargetInside, close}) => {
          // this event handler calls subscriptions only if the event occurred inside
          // if we can't determine this information, we don' proceed with auto close
          // since it would already have been done anyways with the previous mouse event
          if (!isDefined(isTargetInside)) {
            return;
          }

          // no `shouldAutoClose` defined means should always auto close
          if (isDefined(shouldAutoClose) && !shouldAutoClose()) {
            return;
          }

          // if `shouldCloseOnClickInside` is not defined, by default we don't close from inside
          if (!isDefined(shouldCloseOnClickInside) || !shouldCloseOnClickInside({event})) {
            return;
          }

          // if target is not inside, we don't auto close
          // (we called it last because it could be the most costly processing compared to other filters above)
          if (!isTargetInside(<HTMLElement>event.target)) {
            return;
          }

          close(event, {reason: 'inside_click', eventType});
          return true;
        });

    // after the `click` event there is no other event we listen to so no need to update any flag
    // contrary to what is done in other event handlers
  }

  private onMouseEvent(event: MouseEvent, eventType: string) {
    // we handle left-click mouse events only
    if (event.button !== 0) {
      return;
    }

    // for one user action, the first mouse event is `mousedown`
    // so it's a good time to reset this flag
    if (eventType === 'mousedown') {
      this._subscriptionExecuted = null;
    }

    // during the same user action a subscription already got called, so we skip processing until next user action
    if (this._subscriptionExecuted) {
      return;
    }

    const oneExecuted = this.arraySome(this.subscriptions, (subscription) => {
      let {mouseEvent, shouldAutoClose, shouldCloseOnClickOutside, isTargetTogglingElement, isTargetInside, close} =
          subscription;

      // by default subscribers will be called on 'mousedown'
      if (!isDefined(mouseEvent)) {
        mouseEvent = 'mousedown';
      }

      // if subscriber's expected event is not actual event, we skip
      if (mouseEvent !== eventType) {
        return;
      }

      // no `shouldAutoClose` defined means should always auto close
      if (isDefined(shouldAutoClose) && !shouldAutoClose()) {
        return;
      }

      // now checking the target; if no filters are defined we will close unconditionally
      const target = <HTMLElement>event.target;

      // if `isTargetTogglingElement` is defined, target should not be the toggling element in order to auto close
      if (isDefined(isTargetTogglingElement) && isTargetTogglingElement(target)) {
        return;
      }

      // in this handler we don't auto close when target is inside
      // if `isTargetInside` is not defined, we can't check it
      // so we consider there is no distinction between inside and outside
      // and we close unconditionally
      if (isDefined(isTargetInside)) {
        if (isTargetInside(target)) {
          return;
        }
        // however, if `shouldCloseOnClickOutside` is not defined
        // we consider we should close (still provided the target is not inside)
        if (isDefined(shouldCloseOnClickOutside) && !shouldCloseOnClickOutside({event})) {
          return;
        }
      }

      close(event, {reason: 'outside_click', eventType});
      return true;
    });

    // let's store a flag to indicate whether a subscription got called or not,
    // for next event handlers of the same user action
    if (this._subscriptionExecuted !== true) {
      this._subscriptionExecuted = oneExecuted;
    }
  }

  private onKeyEvent(event: KeyboardEvent, eventType: string) {
    // we handle the `escape` key only
    if (!['Escape', 'Esc'].includes(event.key)) {
      return;
    }

    // for one user action, the first keyboard event is `keydown`
    // so it's a good time to reset this flag
    if (eventType === 'keydown') {
      this._subscriptionExecuted = null;
    }

    // during the same user action a subscription already got called, so we skip processing until next user action
    if (this._subscriptionExecuted) {
      return;
    }

    const oneExecuted =
        this.arraySome(this.subscriptions, ({keyEvent, shouldAutoClose, shouldCloseOnEscape, close}) => {
          // by default subscribers will be called on 'keyup'
          if (!isDefined(keyEvent)) {
            keyEvent = 'keyup';
          }

          // if subscriber's expected event is not actual event, we skip
          if (keyEvent !== eventType) {
            return;
          }

          // note: no `shouldAutoClose` defined means should always auto close
          if (isDefined(shouldAutoClose) && !shouldAutoClose()) {
            return;
          }

          // if `shouldCloseOnEscape` is not defined, by default we close on escape
          if (isDefined(shouldCloseOnEscape) && !shouldCloseOnEscape({event})) {
            return;
          }

          close(event, {reason: 'escape', eventType});
          return true;
        });

    // let's store a flag to indicate whether a subscription got called or not,
    // for next event handlers of the same user action
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
}
