import {Injectable, RendererFactory2, OnDestroy} from '@angular/core';

import {isDefined} from './util';


export interface CallbackPayload {
    event: Event;
}

export interface SubscriptionSpec {
    keyEvent?: 'keyup' | 'keydown';
    mouseEvent?: 'mouseup' | 'mousedown';

    shouldAutoClose(): boolean;
    shouldCloseOnEscape(payload: CallbackPayload): boolean;
    shouldCloseOnClickOutside(payload: CallbackPayload): boolean;
    shouldCloseOnClickInside(payload: CallbackPayload): boolean;

    isTargetTogglingElement?(target: HTMLElement): boolean;
    isTargetInside(target: HTMLElement): boolean;

    close(event: Event, payload: {
        reason: 'escape' | 'outside_click' | 'inside_click',
        eventType: string
    });
}

export type AutoCloseMode = 'inside' | 'outside';
export type AutoCloseType = boolean | AutoCloseMode;

export interface SubscriptionSpecFactorySpec {
    keyEvent?: SubscriptionSpec['keyEvent'];
    mouseEvent?: SubscriptionSpec['mouseEvent'];
    close: SubscriptionSpec['close'];

    getAutoClose: () => AutoCloseType;
    getElementsInside: () => HTMLElement[];
    getTogglingElement?: () => HTMLElement;
};

export type Subscription = Function;

export type Subscriber = {
    (): void;
    toggle: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
};



@Injectable()
export class AutoCloseService {
    ////////////////////////////////////////////////////////////////////////////
    // Events listening
    ////////////////////////////////////////////////////////////////////////////

    private listenersSubscriptions: Function[];

    constructor(rendererFactory: RendererFactory2) {
        const renderer = rendererFactory.createRenderer(null, null);

        this.listenersSubscriptions = [
            ['click', 'onClickEvent'],
            ['mousedown', 'onMouseEvent'],
            ['mouseup', 'onMouseEvent'],
            ['keydown', 'onKeyEvent'],
            ['keyup', 'onKeyEvent']
        ].map(([type, handler]) => renderer.listen('document', type, event => this[handler](event, type)));
    }

    OnDestroy() {
        this.listenersSubscriptions.forEach(subscription => subscription());
    }



    ////////////////////////////////////////////////////////////////////////////
    // Subscriptions management
    ////////////////////////////////////////////////////////////////////////////

    private subscriptions: SubscriptionSpec[] = [];

    public subscribe(subscriptionSpec: SubscriptionSpec): Subscription {
        const {subscriptions} = this;

        if (!subscriptions.includes(subscriptionSpec)) {
            subscriptions.unshift(subscriptionSpec);
        }

        return () => this.unsubscribe(subscriptionSpec);
    }

    public unsubscribe(subscriptionSpec: SubscriptionSpec) {
        this.subscriptions = this.subscriptions.filter(item => item !== subscriptionSpec);
    }

    public createSubscriber(subscriptionSpec: SubscriptionSpec): Subscriber {
        let subscription: Subscription = null;

        const isSubscribed = () => isDefined(subscription);

        const _subscribe = () => {
            subscription = this.subscribe(subscriptionSpec);
        };

        const _unsubscribe = () => {
            subscription();
            subscription = null;
        };

        const _toggle = () => {
            if (!isSubscribed()) {
                _subscribe();
            } else {
                _unsubscribe();
            }
        };

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
    // FIXME 2018-01-27T00:07:40+01:00
    // Stopping after first subscription executed (closing) works well only if this occurs for the same event
    // There's no issue between keyboard vs mouse events, since they are related to two different use actions
    // (except key enter which triggers clicks, but we don't implement enter)
    // But when handling a mouse down, the upcoming click is triggered and doesn't see a subscription has executed
    // Since those events are global, and there's always either only mousedown (when stopping it) or mousedown THEN click,
    // we could store a state
    ////////////////////////////////////////////////////////////////////////////

    private _subscriptionExecutedOnMouse: boolean;

    private onClickEvent(event: MouseEvent, eventType: string) {
        if (this._subscriptionExecutedOnMouse) { return; }
        if (event.button !== 0) { return; }

        this.arraySome(this.subscriptions, ({
            mouseEvent,

            shouldAutoClose,
            shouldCloseOnClickOutside,
            shouldCloseOnClickInside,

            isTargetTogglingElement,
            isTargetInside,

            close
        }) => {
            if (!isDefined(isTargetInside)) { return; }
            if (!shouldAutoClose()) { return; }
            if (!shouldCloseOnClickInside({event})) { return; }
            if (!isTargetInside(<HTMLElement>event.target)) { return; }

            close(event, {reason: 'inside_click', eventType});
            return true;
        });
    }

    private onMouseEvent(event: MouseEvent, eventType: string) {
        if (eventType === 'mousedown') {
            this._subscriptionExecutedOnMouse = null;
        }
        if (event.button !== 0) { return; }

        const oneExecuted = this.arraySome(this.subscriptions, ({
            mouseEvent,

            shouldAutoClose,
            shouldCloseOnClickOutside,
            shouldCloseOnClickInside,

            isTargetTogglingElement,
            isTargetInside,

            close
        }) => {
            if (!isDefined(mouseEvent) && eventType !== 'mousedown') { return; }
            if (isDefined(mouseEvent) && mouseEvent !== eventType) { return; }

            if (!shouldAutoClose()) { return; }

            const target = <HTMLElement>event.target;

            if (isDefined(isTargetTogglingElement)) {
                if (isTargetTogglingElement(target)) { return; }
            }

            if (isDefined(isTargetInside)) {
                const isInside = isTargetInside(target);
                if (isInside) { return; }
                if (!shouldCloseOnClickOutside({event})) { return; }
            }

            close(event, {reason: 'outside_click', eventType});
            return true;
        });

        if (this._subscriptionExecutedOnMouse !== true) {
            this._subscriptionExecutedOnMouse = oneExecuted;
        }
    }

    private onKeyEvent(event: KeyboardEvent, eventType: string) {
        if (!['Escape', 'Esc'].includes(event.key)) { return; }

        this.arraySome(this.subscriptions, ({
            keyEvent,

            shouldAutoClose,
            shouldCloseOnEscape,

            close
        }) => {
            if (!isDefined(keyEvent) && eventType !== 'keyup') { return; }
            if (isDefined(keyEvent) && keyEvent !== eventType) { return; }

            if (!shouldAutoClose()) { return; }

            if (!shouldCloseOnEscape({event})) { return; }

            close(event, {reason: 'escape', eventType});
            return true;
        });
    }



    ////////////////////////////////////////////////////////////////////////////
    // Facilitation
    ////////////////////////////////////////////////////////////////////////////

    public arraySome(array: any[], predicate): boolean {
        return array.findIndex(predicate) !== -1;
    }

    public safeElementContains(element: HTMLElement | null, descendant: HTMLElement): boolean {
        return !isDefined(element) ? false : element.contains(descendant);
    }

    public subscriptionSpecFactory({
        keyEvent,
        mouseEvent,
        getAutoClose,
        getElementsInside,
        getTogglingElement,
        close
    }: SubscriptionSpecFactorySpec): SubscriptionSpec {
        return Object.assign({
            isTargetInside: this.isTargetInsideFactory(getElementsInside),
            isTargetTogglingElement: !isDefined(getTogglingElement) ? undefined : this.isTargetTogglingElementFactory(getTogglingElement),
            close,
            keyEvent,
            mouseEvent
        }, this.shouldCloseFactory(getAutoClose));
    }

    public isTargetTogglingElementFactory(getTogglingElement: SubscriptionSpecFactorySpec['getTogglingElement']) {
        return (target: HTMLElement) => this.safeElementContains(getTogglingElement(), target);
    }

    public isTargetInsideFactory(getElementsInside: SubscriptionSpecFactorySpec['getElementsInside']) {
        return target => this.arraySome(getElementsInside(), element => this.safeElementContains(element, target));
    }

    public shouldCloseFactory(getAutoClose: SubscriptionSpecFactorySpec['getAutoClose']) {
        const isTrueOr = (alternative: AutoCloseMode) => () => {
            const autoClose = getAutoClose();
            return !!(autoClose === true || autoClose === alternative);
        };

        const shouldAutoClose = () => getAutoClose() !== false;

        return {
            shouldAutoClose,
            shouldCloseOnEscape: shouldAutoClose,
            shouldCloseOnClickInside: isTrueOr('inside'),
            shouldCloseOnClickOutside: isTrueOr('outside')
        };
    }
}
