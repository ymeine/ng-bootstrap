import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  QueryList,
  TemplateRef,
  ElementRef,
  Renderer2
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

import {NgbCarouselConfig} from './carousel-config';

import {merge, Subject, timer} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import { Transition, TransitionOptions } from '../util/transition/ngbTransition';

let nextId = 0;

/**
 * Represents an individual slide to be used within a carousel.
 */
@Directive({selector: 'ng-template[ngbSlide]'})
export class NgbSlide {
  /**
   * Unique slide identifier. Must be unique for the entire document for proper accessibility support.
   * Will be auto-generated if not provided.
   */
  @Input() id = `ngb-slide-${nextId++}`;
  transitionRunning = false;

  constructor(public tplRef: TemplateRef<any>) {}
}

/**
 * Directive to easily create carousels based on Bootstrap's markup.
 */
@Component({
  selector: 'ngb-carousel',
  exportAs: 'ngbCarousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'carousel slide',
    '[style.display]': '"block"',
    'tabIndex': '0',
    '(mouseenter)': 'pauseOnHover && pause()',
    '(mouseleave)': 'pauseOnHover && cycle()',
    '(keydown.arrowLeft)': 'keyboard && prev()',
    '(keydown.arrowRight)': 'keyboard && next()'
  },
  template: `
    <ol class="carousel-indicators" *ngIf="showNavigationIndicators">
      <li *ngFor="let slide of slides" [id]="slide.id" [class.active]="slide.id === activeId"
          (click)="select(slide.id); pauseOnHover && pause()"></li>
    </ol>
    <div class="carousel-inner">
      <div *ngFor="let slide of slides" class="carousel-item" [id]="'ngb-slide-' + slide.id">
        <ng-template [ngTemplateOutlet]="slide.tplRef"></ng-template>
      </div>
    </div>
    <a class="carousel-control-prev" role="button" (click)="prev()" *ngIf="showNavigationArrows">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only" i18n="@@ngb.carousel.previous">Previous</span>
    </a>
    <a class="carousel-control-next" role="button" (click)="next()" *ngIf="showNavigationArrows">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only" i18n="@@ngb.carousel.next">Next</span>
    </a>
  `
})
export class NgbCarousel implements AfterContentChecked,
    AfterContentInit, OnChanges, OnDestroy {
  @ContentChildren(NgbSlide) slides: QueryList<NgbSlide>;

  private _destroy$ = new Subject<void>();
  private _start$ = new Subject<void>();
  private _stop$ = new Subject<void>();

  private _activeTransition: Transition;
  private _outTransition: Transition;
  private _inTransition: Transition;

  /**
   * A flag to enable/disable the animation when closing.
   */
  @Input() enableAnimation: boolean;

  /**
   * The active slide id.
   */
  @Input() activeId: string;


  /**
   * Amount of time in milliseconds before next slide is shown.
   */
  @Input() interval: number;

  /**
   * Whether can wrap from the last to the first slide.
   */
  @Input() wrap: boolean;

  /**
   * A flag for allowing navigation via keyboard
   */
  @Input() keyboard: boolean;

  /**
   * A flag to enable slide cycling pause/resume on mouseover.
   * @since 2.2.0
   */
  @Input() pauseOnHover: boolean;

  /**
   * A flag to show / hide navigation arrows.
   * @since 2.2.0
   */
  @Input() showNavigationArrows: boolean;

  /**
   * A flag to show / hide navigation indicators.
   * @since 2.2.0
   */
  @Input() showNavigationIndicators: boolean;

  /**
   * A carousel slide event fired when the slide transition is completed.
   * See NgbSlideEvent for payload details
   */
  @Output() slide = new EventEmitter<NgbSlideEvent>();



  constructor(
      config: NgbCarouselConfig, @Inject(PLATFORM_ID) private _platformId, private _ngZone: NgZone,
      private _cd: ChangeDetectorRef, private _element: ElementRef, private _renderer: Renderer2) {
    this.enableAnimation = config.enableAnimation;
    this.interval = config.interval;
    this.wrap = config.wrap;
    this.keyboard = config.keyboard;
    this.pauseOnHover = config.pauseOnHover;
    this.showNavigationArrows = config.showNavigationArrows;
    this.showNavigationIndicators = config.showNavigationIndicators;

    this._activeTransition = new Transition({classname: 'active'}, this._renderer);

    this._outTransition = new Transition({
      beforeTransitionStart: (panelElement: HTMLElement, options: TransitionOptions) => {
        this._renderer.addClass(panelElement, 'carousel-item-' + options.data.direction);
      },
      afterTransitionEnd: (panelElement: HTMLElement, options: TransitionOptions) => {
        this._renderer.removeClass(panelElement, 'carousel-item-' + options.data.direction);
        this._renderer.removeClass(panelElement, 'active');
      }
    }, this._renderer);

    this._inTransition = new Transition({
      beforeTransitionStart: (panelElement: HTMLElement, options: TransitionOptions) => {
        let classname = options.data.direction === NgbSlideEventDirection.LEFT ?
          'carousel-item-next' :
          'carousel-item-prev';

        this._renderer.addClass(panelElement, classname);

        // Reflow
        /* tslint:disable:no-unused-expression */
        panelElement.offsetHeight;

        this._renderer.addClass(panelElement, 'carousel-item-' + options.data.direction);

      },
      afterTransitionEnd: (panelElement: HTMLElement, options: TransitionOptions) => {
        let classname = options.data.direction === NgbSlideEventDirection.LEFT ?
          'carousel-item-next' :
          'carousel-item-prev';
        this._renderer.removeClass(panelElement, classname);
        this._renderer.removeClass(panelElement, 'carousel-item-' + options.data.direction);
        this._renderer.addClass(panelElement, 'active');
      }
    }, this._renderer);


  }

  ngAfterContentInit() {
    // setInterval() doesn't play well with SSR and protractor,
    // so we should run it in the browser and outside Angular
    if (isPlatformBrowser(this._platformId)) {
      this._ngZone.runOutsideAngular(() => {
        this._start$
            .pipe(
                map(() => this.interval), filter(interval => interval > 0 && this.slides.length > 0),
                switchMap(interval => timer(interval).pipe(takeUntil(merge(this._stop$, this._destroy$)))))
            .subscribe(() => this._ngZone.run(() => this.next()));

        this._start$.next();
      });
    }

    this.slides.changes.pipe(takeUntil(this._destroy$)).subscribe(() => this._cd.markForCheck());
  }

  ngAfterContentChecked() {
    let activeSlide = this._getSlideById(this.activeId);
    const oldActiveId = this.activeId;
    this.activeId = activeSlide ? activeSlide.id : (this.slides.length ? this.slides.first.id : null);
    if (this.activeId && oldActiveId !== this.activeId) {
      setTimeout(() => {
        this._activeTransition.show(this._getSlideElement(this.activeId), {enableAnimation: false});
      }, 0);
    }
  }

  ngOnDestroy() { this._destroy$.next(); }

  ngOnChanges(changes) {
    if ('interval' in changes && !changes['interval'].isFirstChange()) {
      this._start$.next();
    }
  }

  /**
   * Navigate to a slide with the specified identifier.
   */
  select(slideId: string) { this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId)); }

  /**
   * Navigate to the next slide.
   */
  prev() { this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.RIGHT); }

  /**
   * Navigate to the next slide.
   */
  next() { this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.LEFT); }

  /**
   * Stops the carousel from cycling through items.
   */
  pause() { this._stop$.next(); }

  /**
   * Restarts cycling through the carousel slides from left to right.
   */
  cycle() { this._start$.next(); }

  private _cycleToSelected(slideIdx: string, direction: NgbSlideEventDirection) {
    let selectedSlide = this._getSlideById(slideIdx);
    if (selectedSlide && selectedSlide.id !== this.activeId) {
      this.slide.emit({prev: this.activeId, current: selectedSlide.id, direction: direction});

      Promise.all([
        this._outTransition.show(
          this._getSlideElement(this.activeId),
          {
            enableAnimation: this.enableAnimation,
            data: {
              direction: direction
            }
          }
        ),
        this._inTransition.show(
          this._getSlideElement(selectedSlide.id),
          {
            enableAnimation: this.enableAnimation,
            data: {
              direction: direction
            }
          }
        )
      ]).then(() => {
        this._start$.next();
        this.activeId = selectedSlide.id;
        // Required to update the indicators
        this._cd.detectChanges();
      });

    }

    // we get here after the interval fires or any external API call like next(), prev() or select()
    this._cd.markForCheck();
  }

  private _getSlideEventDirection(currentActiveSlideId: string, nextActiveSlideId: string): NgbSlideEventDirection {
    const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
    const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);

    return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.RIGHT : NgbSlideEventDirection.LEFT;
  }

  private _getSlideById(slideId: string): NgbSlide { return this.slides.find(slide => slide.id === slideId); }

  private _getSlideIdxById(slideId: string): number {
    return this.slides.toArray().indexOf(this._getSlideById(slideId));
  }

  private _getNextSlide(currentSlideId: string): string {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isLastSlide = currentSlideIdx === slideArr.length - 1;

    return isLastSlide ? (this.wrap ? slideArr[0].id : slideArr[slideArr.length - 1].id) :
                         slideArr[currentSlideIdx + 1].id;
  }

  private _getPrevSlide(currentSlideId: string): string {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isFirstSlide = currentSlideIdx === 0;

    return isFirstSlide ? (this.wrap ? slideArr[slideArr.length - 1].id : slideArr[0].id) :
                          slideArr[currentSlideIdx - 1].id;
  }

  private _getSlideElement(tabId: string): HTMLElement {
    return this._element.nativeElement.querySelector('#ngb-slide-' + tabId);
  }

}

/**
 * The payload of the slide event fired when the slide transition is completed
 */
export interface NgbSlideEvent {
  /**
   * Previous slide id
   */
  prev: string;

  /**
   * New slide ids
   */
  current: string;

  /**
   * Slide event direction
   */
  direction: NgbSlideEventDirection;
}

/**
 * Enum to define the carousel slide event direction
 */
export enum NgbSlideEventDirection {
  LEFT = <any>'left',
  RIGHT = <any>'right'
}

export const NGB_CAROUSEL_DIRECTIVES = [NgbCarousel, NgbSlide];
