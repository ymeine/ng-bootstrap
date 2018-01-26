import {Injectable, RendererFactory2, OnDestroy} from '@angular/core';

import {isDefined} from './util';



export interface SubscriptionSpec {
    keyEvent?: 'keyup' | 'keydown';
    mouseEvent?: 'mouseup' | 'mousedown';

    shouldAutoClose(): boolean;
    shouldCloseOnEscape(): boolean;
    shouldCloseOnClickOutside(): boolean;
    shouldCloseOnClickInside(): boolean;

    isTargetTogglingElement?(target: HTMLElement): boolean;
    isTargetInside(target: HTMLElement): boolean;

    close();
}

export type Subscription = Function;

export type Subscriber = {
    (): void;
    toggle: () => void;
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
            subscriptions.push(subscriptionSpec);
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

    private onClickEvent(event: MouseEvent, type: string) {
        if (event.button !== 0) { return; }

        this.subscriptions.forEach(({
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
            if (!shouldCloseOnClickInside()) { return; }
            if (!isTargetInside(<HTMLElement>event.target)) { return; }

            close();
        });
    }

    private onMouseEvent(event: MouseEvent, type: string) {
        if (event.button !== 0) { return; }

        this.subscriptions.forEach(({
            mouseEvent,

            shouldAutoClose,
            shouldCloseOnClickOutside,
            shouldCloseOnClickInside,

            isTargetTogglingElement,
            isTargetInside,

            close
        }) => {
            if (!isDefined(mouseEvent) && type !== 'mousedown') { return; }
            if (isDefined(mouseEvent) && mouseEvent !== type) { return; }

            if (!shouldAutoClose()) { return; }

            const target = <HTMLElement>event.target;

            if (isDefined(isTargetTogglingElement)) {
                if (isTargetTogglingElement(target)) { return; }
            }

            if (isDefined(isTargetInside)) {
                const isInside = isTargetInside(target);
                if (isInside) { return; }
                if (!shouldCloseOnClickOutside()) { return; }
            }

            close();
        });
    }

    private onKeyEvent(event, type) {
        if (!['Escape', 'Esc'].includes(event.key)) { return; }

        this.subscriptions.forEach(({
            keyEvent,

            shouldAutoClose,
            shouldCloseOnEscape,

            close
        }) => {
            if (!isDefined(keyEvent) && type !== 'keyup') { return; }
            if (isDefined(keyEvent) && keyEvent !== type) { return; }

            if (!shouldAutoClose()) { return; }

            if (!shouldCloseOnEscape()) { return; }

            close();
        });
    }



    ////////////////////////////////////////////////////////////////////////////
    // Facilitation
    ////////////////////////////////////////////////////////////////////////////

    public subscriptionSpecFactory({getAutoClose, getElementsInside, getTogglingElement, close}): SubscriptionSpec {
        return Object.assign({
            isTargetInside: this.isTargetInsideFactory(getElementsInside),
            isTargetTogglingElement: this.isTargetTogglingElementFactory(getTogglingElement),
            close
        }, this.shouldCloseFactory(getAutoClose));
    }

    public isTargetTogglingElementFactory(getTogglingElement: () => HTMLElement) {
        return target => getTogglingElement().contains(target);
    }

    public isTargetInsideFactory(getElementsInside: () => HTMLElement[]) {
        return target => isDefined(getElementsInside().find(element => element.contains(target)));
    }

    public shouldCloseFactory(getAutoClose) {
        const isTrueOr = alternative => () => {
            const autoClose = getAutoClose();
            return !!(autoClose === true || autoClose === alternative);
        }

        const shouldAutoClose = () => getAutoClose() !== false;

        return {
            shouldAutoClose,
            shouldCloseOnEscape: shouldAutoClose,
            shouldCloseOnClickInside: isTrueOr('inside'),
            shouldCloseOnClickOutside: isTrueOr('outside')
        };
    }
}
