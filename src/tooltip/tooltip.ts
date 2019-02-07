import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Inject,
  Injector,
  Renderer2,
  ComponentRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  NgZone,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {listenToTriggers} from '../util/triggers';
import {positionElements, Placement, PlacementArray} from '../util/positioning';
import {PopupService} from '../util/popup';

import {NgbTooltipConfig} from './tooltip-config';
import {AutoClose} from '../util/autoclose';

let nextId = 0;

@Component({
  selector: 'ngb-tooltip-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {'[class]': '"tooltip fade" + (tooltipClass ? " " + tooltipClass : "")', 'role': 'tooltip', '[id]': 'id'},
  template: `<div class="arrow"></div><div class="tooltip-inner"><ng-content></ng-content></div>`,
  styleUrls: ['./tooltip.scss']
})
export class NgbTooltipWindow {
  @Input() id: string;
  @Input() tooltipClass: string;
}

/**
 * A lightweight, extensible directive for fancy tooltip creation.
 */
@Directive({selector: '[ngbTooltip]', exportAs: 'ngbTooltip'})
export class NgbTooltip implements OnInit, OnDestroy {
  /**
  * A flag to enable/disable the animation when closing.
  */
  @Input() enableAnimation: boolean;

  /**
   * Indicates whether the tooltip should be closed on Escape key and inside/outside clicks.
   *
   * - true (default): closes on both outside and inside clicks as well as Escape presses
   * - false: disables the autoClose feature (NB: triggers still apply)
   * - 'inside': closes on inside clicks as well as Escape presses
   * - 'outside': closes on outside clicks (sometimes also achievable through triggers)
   * as well as Escape presses
   *
   * @since 3.0.0
   */
  @Input() autoClose: boolean | 'inside' | 'outside';
  /**
    * Placement of a tooltip accepts:
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
   * A selector specifying the element the tooltip should be appended to.
   * Currently only supports "body".
   */
  @Input() container: string;
  /**
   * A flag indicating if a given tooltip is disabled and should not be displayed.
   *
   * @since 1.1.0
   */
  @Input() disableTooltip: boolean;
  /**
   * An optional class applied to ngb-tooltip-window
   *
   * @since 3.2.0
   */
  @Input() tooltipClass: string;
  /**
   * Emits an event when the tooltip is shown
   */
  @Output() shown = new EventEmitter();
  /**
   * Emits an event when the tooltip is hidden
   */
  @Output() hidden = new EventEmitter();

  private _ngbTooltip: string | TemplateRef<any>;
  private _ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;
  private _popupService: PopupService<NgbTooltipWindow>;
  private _windowRef: ComponentRef<NgbTooltipWindow>;
  private _unregisterListenersFn;
  private _zoneSubscription: any;

  constructor(
      private _elementRef: ElementRef<HTMLElement>, private _renderer: Renderer2, injector: Injector,
      componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: NgbTooltipConfig,
      private _ngZone: NgZone, @Inject(DOCUMENT) private _document: any, private _autoClose: AutoClose,
      private _changeDetector: ChangeDetectorRef) {
    this.enableAnimation = config.enableAnimation;
    this.autoClose = config.autoClose;
    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
    this.disableTooltip = config.disableTooltip;
    this.tooltipClass = config.tooltipClass;
    this._popupService = new PopupService<NgbTooltipWindow>(
        NgbTooltipWindow, injector, viewContainerRef, _renderer, _elementRef, componentFactoryResolver);

    this._zoneSubscription = _ngZone.onStable.subscribe(() => {
      if (this._windowRef) {
        positionElements(
            this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
            this.container === 'body', 'bs-tooltip');
      }
    });
  }

  /**
   * Content to be displayed as tooltip. If falsy, the tooltip won't open.
   */
  @Input()
  set ngbTooltip(value: string | TemplateRef<any>) {
    this._ngbTooltip = value;
    if (!value && this._windowRef) {
      this.close();
    }
  }

  get ngbTooltip() { return this._ngbTooltip; }

  /**
   * Opens an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   * The context is an optional value to be injected into the tooltip template when it is created.
   */
  open(context?: any) {
    if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
      this._windowRef = this._popupService.open(this._ngbTooltip, context, this.enableAnimation);
      this._windowRef.instance.tooltipClass = this.tooltipClass;
      this._windowRef.instance.id = this._ngbTooltipWindowId;

      this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', this._ngbTooltipWindowId);

      if (this.container === 'body') {
        this._document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }

      // apply styling to set basic css-classes on target element, before going for positioning
      this._windowRef.changeDetectorRef.markForCheck();

      this._autoClose.install(
          this.autoClose, () => this.close(), this.hidden, [this._windowRef.location.nativeElement]);

      this.shown.emit();
    }
  }

  /**
   * Closes an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   */
  close(): Promise<void> {
    let promise: Promise<void>;
    if (this._windowRef != null) {
      this._renderer.removeAttribute(this._elementRef.nativeElement, 'aria-describedby');
      promise = this._popupService.close(this.enableAnimation);
      this._windowRef = null;
      this.hidden.emit();
      this._changeDetector.markForCheck();
    } else {
      promise = Promise.resolve();
    }
    return promise;
  }

  /**
   * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   */
  toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether or not the tooltip is currently being shown
   */
  isOpen(): boolean { return this._windowRef != null; }

  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
        this._renderer, this._elementRef.nativeElement, this.triggers, this.open.bind(this), this.close.bind(this),
        this.toggle.bind(this));
  }

  ngOnDestroy() {
    this.close();
    // This check is needed as it might happen that ngOnDestroy is called before ngOnInit
    // under certain conditions, see: https://github.com/ng-bootstrap/ng-bootstrap/issues/2199
    if (this._unregisterListenersFn) {
      this._unregisterListenersFn();
    }
    this._zoneSubscription.unsubscribe();
  }
}
