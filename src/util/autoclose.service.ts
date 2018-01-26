import {Injectable, RendererFactory2, OnDestroy} from '@angular/core';

import {isDefined} from './util';



export interface Subscriber {
    keyEvent?: 'keyup' | 'keydown';
    mouseEvent?: 'mouseup' | 'mousedown';

    shouldAutoClose(): boolean;
    shouldCloseOnEscape(): boolean;
    shouldCloseOnClickOutside(): boolean;
    shouldCloseOnClickInside(): boolean;

    isTargetInside(target: HTMLElement): boolean;

    close();
}



@Injectable()
export class AutoCloseService {
    ////////////////////////////////////////////////////////////////////////////
    // Events listening
    ////////////////////////////////////////////////////////////////////////////

    private listenersSubscriptions: Function[];

    constructor(rendererFactory: RendererFactory2) {
        const renderer = rendererFactory.createRenderer(null, null);

        this.listenersSubscriptions = [
            ['mousedown', 'onMouseEvent'],
            ['mouseup', 'onMouseEvent'],
            ['keydown', 'onKeyEvent'],
            ['keyup', 'onKeyEvent']
        ].map(([type, handler]) => renderer.listen('document', type, event => this.onMouseEvent(event, type)));
    }

    OnDestroy() {
        this.listenersSubscriptions.forEach(subscription => subscription());
    }



    ////////////////////////////////////////////////////////////////////////////
    // Subscriptions management
    ////////////////////////////////////////////////////////////////////////////

    private subscribers: Subscriber[] = [];

    public subscribe(subscriber: Subscriber) {
        const {subscribers} = this;

        if (!subscribers.includes(subscriber)) {
            subscribers.push(subscriber);
        }

        return () => this.unsubscribe(subscriber);
    }

    public unsubscribe(subscriber: Subscriber) {
        this.subscribers = this.subscribers.filter(item => item !== subscriber);
    }



    ////////////////////////////////////////////////////////////////////////////
    // Event handling
    ////////////////////////////////////////////////////////////////////////////

    private onMouseEvent(event: MouseEvent, type: string) {
        if (event.button !== 0) { return; }

        this.subscribers.forEach(({
            mouseEvent,

            shouldAutoClose,
            shouldCloseOnClickOutside,
            shouldCloseOnClickInside,

            isTargetInside,
            close
        }) => {
            if (!isDefined(mouseEvent) && mouseEvent !== 'mousedown') { return; }
            if (isDefined(mouseEvent) && mouseEvent !== type) { return; }
            if (!shouldAutoClose()) { return; }
            const isInside = isTargetInside(<HTMLElement>event.target);
            if (isInside && !shouldCloseOnClickInside()) { return; }
            if (!isInside && !shouldCloseOnClickOutside()) { return; }

            close();
        });
    }

    private onKeyEvent(event, type) {
        if (!['Escape', 'Esc'].includes(event.key)) { return; }

        this.subscribers.forEach(({
            keyEvent,

            shouldAutoClose,
            shouldCloseOnEscape,

            close
        }) => {
            if (!isDefined(keyEvent) && keyEvent !== 'keyup') { return; }
            if (isDefined(keyEvent) && keyEvent !== type) { return; }
            if (!shouldAutoClose()) { return; }
            if (!shouldCloseOnEscape()) { return; }

            close();
        });
    }



    ////////////////////////////////////////////////////////////////////////////
    // Facilitation
    ////////////////////////////////////////////////////////////////////////////

    public easySubscribe({getAutoClose, getElementsInside, close}) {
        const subscriber: Subscriber = Object.assign({
            isTargetInside: this.isTargetInsideFactory(getElementsInside),
            close
        }, this.shouldCloseFactory(getAutoClose));

        return this.subscribe(subscriber);
    }

    public isTargetInsideFactory(getElementsInside: () => HTMLElement[]) {
        return (target) => isDefined(getElementsInside().find(element => element.contains(target)));
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
