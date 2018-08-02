import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  OnChanges,
  Inject,
  Injector,
  Renderer2,
  ComponentRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  NgZone,
  SimpleChanges
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {fromEvent, race} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

import {listenToTriggers, parseTriggers} from '../util/triggers';
import {positionElements, Placement, PlacementArray} from '../util/positioning';
import {PopupService} from '../util/popup';
import {Key} from '../util/key';

import {NgbPopoverConfig} from './popover-config';

let nextId = 0;

@Component({
  selector: 'ngb-popover-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]':
        '"popover bs-popover-" + placement.split("-")[0]+" bs-popover-" + placement + (popoverClass ? " " + popoverClass : "")',
    'role': 'tooltip',
    '[id]': 'id'
  },
  template: `
    <div class="arrow"></div>
    <h3 class="popover-header">{{title}}</h3><div class="popover-body"><ng-content></ng-content></div>`,
  styles: [`
    :host.bs-popover-top .arrow, :host.bs-popover-bottom .arrow {
      left: 50%;
      margin-left: -5px;
    }

    :host.bs-popover-top-left .arrow, :host.bs-popover-bottom-left .arrow {
      left: 2em;
    }

    :host.bs-popover-top-right .arrow, :host.bs-popover-bottom-right .arrow {
      left: auto;
      right: 2em;
    }

    :host.bs-popover-left .arrow, :host.bs-popover-right .arrow {
      top: 50%;
      margin-top: -5px;
    }

    :host.bs-popover-left-top .arrow, :host.bs-popover-right-top .arrow {
      top: 0.7em;
    }

    :host.bs-popover-left-bottom .arrow, :host.bs-popover-right-bottom .arrow {
      top: auto;
      bottom: 0.7em;
    }
  `]
})
export class NgbPopoverWindow {
  @Input() placement: Placement = 'top';
  @Input() title: string;
  @Input() id: string;
  @Input() popoverClass: string;

  constructor(private _element: ElementRef<HTMLElement>, private _renderer: Renderer2) {}

  applyPlacement(_placement: Placement) {
    // remove the current placement classes
    this._renderer.removeClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString().split('-')[0]);
    this._renderer.removeClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString());

    // set the new placement classes
    this.placement = _placement;

    // apply the new placement
    this._renderer.addClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString().split('-')[0]);
    this._renderer.addClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString());
  }

  /**
   * Tells whether the event has been triggered from this component's subtree or not.
   *
   * @param event the event to check
   *
   * @return whether the event has been triggered from this component's subtree or not.
   */
  isEventFrom(event: Event): boolean { return this._element.nativeElement.contains(event.target as HTMLElement); }
}

/**
 * A directive to mark an element to be excluded from the automatic closing (autoClose) of the popover.
 */
@Directive({selector: '[ngbPopoverToggle]'})
export class NgbPopoverToggle {
  /**
   * A reference to the `NgbPopover` instance.
   */
  @Input()
  set ngbPopoverToggle(popover: NgbPopover) {
    popover.registerClickableElement(this._element.nativeElement);
  };

  constructor(private _element: ElementRef<HTMLElement>) {}
}

/**
 * A lightweight, extensible directive for fancy popover creation.
 */
@Directive({selector: '[ngbPopover]', exportAs: 'ngbPopover'})
export class NgbPopover implements OnInit, OnDestroy, OnChanges {
  /**
   * Indicates that popover should be closed on clicks inside the popover,
   * outside the popover, or both, and on pressing Escape, or not at all.
   *
   * - true (default): closes on both outside and inside clicks as well as Escape presses
   * - false: disables the autoClose feature (NB: triggers still apply)
   * - 'inside': closes on inside clicks as well as Escape presses
   * - 'outside': closes on outside clicks (sometimes also achievable through triggers)
   * as well as Escape presses
   *
   * Use registerClickableElement to ignore some elements from anywhere (either inside or outside the popover).
   *
   * When using 'outside' or true, you MUST register any element which opens,
   * closes or toggles the popover by using registerClickableElement.
   * Note that if the popover's target has at least one trigger defined with a
   * clicking MouseEvent (mousedown, mouseup or click), this target will be
   * automatically registered to be excluded.
   *
   * If using 'inside' and having some interactive elements inside the popover, also register them using registerClickableElement.
   *
   * To avoid using registerClickableElement directly, the directive called NgbPopoverToggle can be used when applicable.
   */
  @Input() autoClose: boolean | 'inside' | 'outside';
  /**
   * Content to be displayed as popover. If title and content are empty, the popover won't open.
   */
  @Input() ngbPopover: string | TemplateRef<any>;
  /**
   * Title of a popover. If title and content are empty, the popover won't open.
   */
  @Input() popoverTitle: string;
  /**
   * Placement of a popover accepts:
   *    "top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right",
   *    "left", "left-top", "left-bottom", "right", "right-top", "right-bottom"
   * and array of above values.
   */
  @Input() placement: PlacementArray;
  /**
   * Specifies events that should trigger. Supports a space separated list of event names.
   */
  @Input() triggers: string;
  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports "body".
   */
  @Input() container: string;
  /**
   * A flag indicating if a given popover is disabled and should not be displayed.
   *
   * @since 1.1.0
   */
  @Input() disablePopover: boolean;
  /**
   * An optional class applied to ngb-popover-window
   *
   * @since 2.2.0
   */
  @Input() popoverClass: string;
  /**
   * Emits an event when the popover is shown
   */
  @Output() shown = new EventEmitter();
  /**
   * Emits an event when the popover is hidden
   */
  @Output() hidden = new EventEmitter();

  private _clickableElements = new Set<HTMLElement>();
  private _ngbPopoverWindowId = `ngb-popover-${nextId++}`;
  private _popupService: PopupService<NgbPopoverWindow>;
  private _windowRef: ComponentRef<NgbPopoverWindow>;
  private _unregisterListenersFn;
  private _zoneSubscription: any;
  private _isDisabled(): boolean {
    if (this.disablePopover) {
      return true;
    }
    if (!this.ngbPopover && !this.popoverTitle) {
      return true;
    }
    return false;
  }

  constructor(
      private _elementRef: ElementRef<HTMLElement>, private _renderer: Renderer2, injector: Injector,
      componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: NgbPopoverConfig,
      private _ngZone: NgZone, @Inject(DOCUMENT) private _document: any) {
    this.autoClose = config.autoClose;
    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
    this.disablePopover = config.disablePopover;
    this.popoverClass = config.popoverClass;
    this._popupService = new PopupService<NgbPopoverWindow>(
        NgbPopoverWindow, injector, viewContainerRef, _renderer, componentFactoryResolver);

    this._zoneSubscription = _ngZone.onStable.subscribe(() => {
      if (this._windowRef) {
        this._windowRef.instance.applyPlacement(
            positionElements(
                this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
                this.container === 'body'));
      }
    });
  }

  /**
   * Opens an element’s popover. This is considered a “manual” triggering of the popover.
   * The context is an optional value to be injected into the popover template when it is created.
   */
  open(context?: any) {
    if (!this._windowRef && !this._isDisabled()) {
      this._windowRef = this._popupService.open(this.ngbPopover, context);
      this._windowRef.instance.title = this.popoverTitle;
      this._windowRef.instance.popoverClass = this.popoverClass;
      this._windowRef.instance.id = this._ngbPopoverWindowId;

      this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', this._ngbPopoverWindowId);

      if (this.container === 'body') {
        this._document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }

      // apply styling to set basic css-classes on target element, before going for positioning
      this._windowRef.changeDetectorRef.detectChanges();
      this._windowRef.changeDetectorRef.markForCheck();

      // position popover along the element
      this._windowRef.instance.applyPlacement(
          positionElements(
              this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
              this.container === 'body'));

      if (this.autoClose) {
        this._ngZone.runOutsideAngular(() => {
          const escapes$ = fromEvent<KeyboardEvent>(this._document, 'keyup')
                               .pipe(takeUntil(this.hidden), filter(event => event.which === Key.Escape));

          const clicks$ = fromEvent<MouseEvent>(this._document, 'click')
                              .pipe(takeUntil(this.hidden), filter(event => this._shouldCloseFromClick(event)));

          race<Event>([escapes$, clicks$]).subscribe(() => this._ngZone.run(() => this.close()));
        });
      }

      this.shown.emit();
    }
  }

  /**
   * Registers an HTML element outside of the popover as clickable.
   *
   * Clicking on this element will not close the popover when [autoClose]="'outside'" is used.
   *
   * @param element the element to register as clickable
   */
  registerClickableElement(element: HTMLElement) { this._clickableElements.add(element); }

  private _shouldCloseFromClick(event: MouseEvent) {
    if (event.button !== 2 && !this._isEventFromClickableElement(event)) {
      if (this.autoClose === true) {
        return true;
      } else if (this.autoClose === 'inside' && this._isEventFromPopover(event)) {
        return true;
      } else if (this.autoClose === 'outside' && !this._isEventFromPopover(event)) {
        return true
      }
    }
    return false;
  }

  private _isEventFromClickableElement(event: MouseEvent) {
    return Array.from(this._clickableElements).some(element => element.contains(event.target as HTMLElement));
  }

  private _isEventFromPopover(event: MouseEvent) {
    const popup = this._windowRef.instance;
    return popup ? popup.isEventFrom(event) : false;
  }

  /**
   * Closes an element’s popover. This is considered a “manual” triggering of the popover.
   */
  close(): void {
    if (this._windowRef) {
      this._renderer.removeAttribute(this._elementRef.nativeElement, 'aria-describedby');
      this._popupService.close();
      this._windowRef = null;
      this.hidden.emit();
    }
  }

  /**
   * Toggles an element’s popover. This is considered a “manual” triggering of the popover.
   */
  toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether or not the popover is currently being shown
   */
  isOpen(): boolean { return this._windowRef != null; }

  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
        this._renderer, this._elementRef.nativeElement, this.triggers, this.open.bind(this), this.close.bind(this),
        this.toggle.bind(this));

    const togglerEvents = ['mousedown', 'mouseup', 'click'];
    if (parseTriggers(this.triggers)
            .some(
                trigger => !trigger.isManual() &&
                    (togglerEvents.includes(trigger.open) || togglerEvents.includes(trigger.close)))) {
      this.registerClickableElement(this._elementRef.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // close popover if title and content become empty, or disablePopover set to true
    if ((changes['ngbPopover'] || changes['popoverTitle'] || changes['disablePopover']) && this._isDisabled()) {
      this.close();
    }
  }

  ngOnDestroy() {
    this.close();
    this._unregisterListenersFn();
    this._zoneSubscription.unsubscribe();
  }
}
