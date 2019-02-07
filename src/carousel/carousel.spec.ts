import {fakeAsync, discardPeriodicTasks, tick, TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {createGenericTestComponent} from '../test/common';

import {By} from '@angular/platform-browser';
import {ChangeDetectionStrategy, Component} from '@angular/core';

import {NgbCarouselModule} from './carousel.module';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventDirection} from './carousel';
import {NgbCarouselConfig} from './carousel-config';

const createTestComponent = (html: string) =>
    createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function expectActiveSlides(nativeEl: HTMLDivElement, active: boolean[]) {
  const slideElms = nativeEl.querySelectorAll('.carousel-item');
  const indicatorElms = nativeEl.querySelectorAll('ol.carousel-indicators > li');

  expect(slideElms.length).toBe(active.length);
  expect(indicatorElms.length).toBe(active.length);

  for (let i = 0; i < active.length; i++) {
    if (active[i]) {
      expect(slideElms[i]).toHaveCssClass('active');
      expect(indicatorElms[i]).toHaveCssClass('active');
    } else {
      expect(slideElms[i]).not.toHaveCssClass('active');
      expect(indicatorElms[i]).not.toHaveCssClass('active');
    }
  }
}

describe('ngb-carousel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent, TestComponentOnPush], imports: [NgbCarouselModule]});
  });

  it('should initialize inputs with default values', () => {
    const defaultConfig = new NgbCarouselConfig();
    const carousel = TestBed.createComponent(NgbCarousel).componentInstance;

    expect(carousel.interval).toBe(defaultConfig.interval);
    expect(carousel.wrap).toBe(defaultConfig.wrap);
    expect(carousel.keyboard).toBe(defaultConfig.keyboard);
    expect(carousel.pauseOnHover).toBe(defaultConfig.pauseOnHover);
    expect(carousel.showNavigationIndicators).toBe(defaultConfig.showNavigationIndicators);
    expect(carousel.showNavigationArrows).toBe(defaultConfig.showNavigationArrows);
  });

  it('should render slides and navigation indicators', fakeAsync(() => {
       const html = `
      <ngb-carousel>
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;
       const fixture = createTestComponent(html);

       const slideElms = fixture.nativeElement.querySelectorAll('.carousel-item');
       expect(slideElms.length).toBe(2);
       expect(slideElms[0].textContent).toMatch(/foo/);
       expect(slideElms[1].textContent).toMatch(/bar/);

       expect(fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li').length).toBe(2);
       expect(fixture.nativeElement.querySelectorAll('[role="button"]').length).toBe(2);

       tick(10);

       discardPeriodicTasks();
     }));


  it('should mark the first slide as active by default', fakeAsync(() => {
       const html = `
      <ngb-carousel>
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);
       tick(10);

       expectActiveSlides(fixture.nativeElement, [true, false]);


       discardPeriodicTasks();
     }));

  it('should work without any slides', fakeAsync(() => {
       const fixture = createTestComponent(`<ngb-carousel [interval]="1000"></ngb-carousel>`);

       tick(1001);
       fixture.detectChanges();

       const carousel = fixture.nativeElement.querySelector('ngb-carousel');
       const slides = fixture.nativeElement.querySelectorAll('.carousel-item');

       expect(carousel).toBeTruthy();
       expect(slides.length).toBe(0);

       discardPeriodicTasks();
     }));


  it('should mark the requested slide as active', fakeAsync(() => {
       const html = `
       <ngb-carousel [activeId]="activeSlideId">
         <ng-template ngbSlide id="1">foo</ng-template>
         <ng-template ngbSlide id="2">bar</ng-template>
       </ngb-carousel>
     `;

       const fixture = createTestComponent(html);

       fixture.componentInstance.activeSlideId = 1;
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       discardPeriodicTasks();
     }));

  it('should auto-correct when slide index is undefined', fakeAsync(() => {
       const html = `
            <ngb-carousel [activeId]="doesntExist">
              <ng-template ngbSlide>foo</ng-template>
              <ng-template ngbSlide>bar</ng-template>
            </ngb-carousel>
          `;

       const fixture = createTestComponent(html);
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       discardPeriodicTasks();
     }));

  it('should change slide on prev/next API calls', fakeAsync(() => {
       const html = `
      <ngb-carousel #c [interval]="0" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
        <ng-template ngbSlide id="s3">baz</ng-template>
      </ngb-carousel>
      <button id="next" (click)="c.next()">Next</button>
      <button id="prev" (click)="c.prev()">Prev</button>
      <button id="select" (click)="c.select('s3')">Select 3</button>
    `;

       const fixture = createTestComponent(html);
       const next = fixture.nativeElement.querySelector('#next');
       const prev = fixture.nativeElement.querySelector('#prev');
       const select = fixture.nativeElement.querySelector('#select');

       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false, false]);

       next.click();
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true, false]);

       prev.click();
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false, false]);

       select.click();
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, false, true]);
     }));

  it('should pause/resume slide change on API calls', fakeAsync(() => {
       const html = `
     <ngb-carousel #c [interval]="1000" [enableAnimation]="false">
       <ng-template ngbSlide>foo</ng-template>
       <ng-template ngbSlide>bar</ng-template>
     </ngb-carousel>
     <button id="pause" (click)="c.pause()">Next</button>
     <button id="cycle" (click)="c.cycle()">Prev</button>
   `;

       const fixture = createTestComponent(html);
       const pause = fixture.nativeElement.querySelector('#pause');
       const cycle = fixture.nativeElement.querySelector('#cycle');

       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(1000);
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       pause.click();
       tick(1000);
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       cycle.click();
       tick(1000);
       fixture.detectChanges();

       expectActiveSlides(fixture.nativeElement, [true, false]);

       discardPeriodicTasks();
     }));

  it('should mark component for check for API calls', fakeAsync(() => {
       const html = `
      <ngb-carousel #c [interval]="0" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
        <ng-template ngbSlide *ngIf="addNewSlide">baz</ng-template>
      </ngb-carousel>
      <button id="next" (click)="c.next(); addNewSlide = true">Next</button>
    `;

       const fixture = createTestComponent(html);
       const next = fixture.nativeElement.querySelector('#next');

       expectActiveSlides(fixture.nativeElement, [true, false]);

       next.click();
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true, false]);
     }));

  it('should mark component for check when slides change', fakeAsync(() => {
       const html = `
      <ngb-carousel #c [interval]="0" [enableAnimation]="false">
        <ng-template ngbSlide *ngFor="let s of slides">
          <div class="slide">{{ s }}</div>
        </ng-template>
      </ngb-carousel>
    `;

       function getSlidesText(element: HTMLElement): string[] {
         return Array.from(element.querySelectorAll('.carousel-item .slide')).map((el: HTMLElement) => el.innerHTML);
       }

       const fixture = createTestComponent(html);
       expect(getSlidesText(fixture.nativeElement)).toEqual(['a', 'b']);

       fixture.componentInstance.slides = ['c', 'd'];
       fixture.detectChanges();
       tick(10);
       expect(getSlidesText(fixture.nativeElement)).toEqual(['c', 'd']);
     }));

  it('should change slide on indicator click', fakeAsync(() => {
       const html = `
     <ngb-carousel [enableAnimation]="false">
       <ng-template ngbSlide>foo</ng-template>
       <ng-template ngbSlide>bar</ng-template>
     </ngb-carousel>
   `;

       const fixture = createTestComponent(html);
       const indicatorElms = fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li');

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       indicatorElms[1].click();
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should fire a slide event with correct direction on indicator click', fakeAsync(() => {
       const html = `
      <ngb-carousel (slide)="carouselSlideCallBack($event)" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
        <ng-template ngbSlide>pluto</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);
       const indicatorElms = fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li');
       const spyCallBack = spyOn(fixture.componentInstance, 'carouselSlideCallBack');

       indicatorElms[1].click();
       fixture.detectChanges();
       tick(10);
       expect(fixture.componentInstance.carouselSlideCallBack).toHaveBeenCalledWith(jasmine.objectContaining({
         direction: NgbSlideEventDirection.LEFT
       }));

       spyCallBack.calls.reset();
       indicatorElms[0].click();
       fixture.detectChanges();
       tick(10);
       expect(fixture.componentInstance.carouselSlideCallBack).toHaveBeenCalledWith(jasmine.objectContaining({
         direction: NgbSlideEventDirection.RIGHT
       }));

       spyCallBack.calls.reset();
       indicatorElms[2].click();
       fixture.detectChanges();
       tick(10);
       expect(fixture.componentInstance.carouselSlideCallBack).toHaveBeenCalledWith(jasmine.objectContaining({
         direction: NgbSlideEventDirection.LEFT
       }));

       discardPeriodicTasks();
     }));

  it('should change slide on carousel control click', fakeAsync(() => {
       const html = `
      <ngb-carousel [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       const prevControlElm = fixture.nativeElement.querySelector('.carousel-control-prev');
       const nextControlElm = fixture.nativeElement.querySelector('.carousel-control-next');

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       nextControlElm.click();  // next
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       prevControlElm.click();  // prev
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       discardPeriodicTasks();
     }));

  it('should fire a slide event with correct direction on carousel control click', fakeAsync(() => {
       const html = `
      <ngb-carousel (slide)="carouselSlideCallBack($event)">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);
       const prevControlElm = fixture.nativeElement.querySelector('.carousel-control-prev');
       const nextControlElm = fixture.nativeElement.querySelector('.carousel-control-next');
       const spyCallBack = spyOn(fixture.componentInstance, 'carouselSlideCallBack');

       prevControlElm.click();
       fixture.detectChanges();
       tick(10);
       expect(fixture.componentInstance.carouselSlideCallBack).toHaveBeenCalledWith(jasmine.objectContaining({
         direction: NgbSlideEventDirection.RIGHT
       }));
       spyCallBack.calls.reset();
       nextControlElm.click();
       fixture.detectChanges();
       tick(10);
       expect(fixture.componentInstance.carouselSlideCallBack).toHaveBeenCalledWith(jasmine.objectContaining({
         direction: NgbSlideEventDirection.LEFT
       }));

       spyCallBack.calls.reset();
       prevControlElm.click();
       fixture.detectChanges();
       tick(10);
       expect(fixture.componentInstance.carouselSlideCallBack).toHaveBeenCalledWith(jasmine.objectContaining({
         direction: NgbSlideEventDirection.RIGHT
       }));

       discardPeriodicTasks();
     }));

  it('should change slide on time passage (default interval value)', fakeAsync(() => {
       const html = `
      <ngb-carousel [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(6000);
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should change slide on time passage in OnPush component (default interval value)', fakeAsync(() => {
       const fixture = createTestComponent('<test-cmp-on-push></test-cmp-on-push>');

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(6000);
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should change slide on time passage (custom interval value)', fakeAsync(() => {
       const html = `
      <ngb-carousel [interval]="2000" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(1000);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(1200);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should not change slide on time passage (custom interval value is zero)', fakeAsync(() => {
       const html = `
      <ngb-carousel [interval]="0" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(1000);
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(1200);
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       discardPeriodicTasks();
     }));

  it('should change slide with different rate when interval value changed', fakeAsync(() => {
       const html = `
      <ngb-carousel [interval]="interval" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
        <ng-template ngbSlide>zoo</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);
       fixture.componentInstance.interval = 5000;
       fixture.detectChanges();
       tick(10);

       expectActiveSlides(fixture.nativeElement, [true, false, false]);

       tick(5001);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [false, true, false]);

       fixture.componentInstance.interval = 1000;
       fixture.detectChanges();

       tick(1001);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [false, false, true]);

       discardPeriodicTasks();
     }));

  it('should listen to mouse events based on pauseOnHover attribute', fakeAsync(() => {

       const html = `
        <ngb-carousel [pauseOnHover]="pauseOnHover" [enableAnimation]="false">
          <ng-template ngbSlide>foo</ng-template>
          <ng-template ngbSlide>bar</ng-template>
        </ngb-carousel>
      `;

       const fixture = createTestComponent(html);

       const carouselDebugEl = fixture.debugElement.query(By.directive(NgbCarousel));

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       carouselDebugEl.triggerEventHandler('mouseenter', {});
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(6000);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       carouselDebugEl.triggerEventHandler('mouseleave', {});
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(6000);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [false, true]);

       fixture.componentInstance.pauseOnHover = false;
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [false, true]);

       carouselDebugEl.triggerEventHandler('mouseenter', {});
       fixture.detectChanges();

       tick(6000);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);
       discardPeriodicTasks();
     }));

  it('should pause / resume slide change with time passage on mouse enter / leave', fakeAsync(() => {
       const html = `
      <ngb-carousel [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       const carouselDebugEl = fixture.debugElement.query(By.directive(NgbCarousel));

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       carouselDebugEl.triggerEventHandler('mouseenter', {});
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(6000);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       carouselDebugEl.triggerEventHandler('mouseleave', {});
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [true, false]);

       tick(6000);
       fixture.detectChanges();
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should wrap slide changes by default', fakeAsync(() => {
       const html = `
      <ngb-carousel [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       const prevControlElm = fixture.nativeElement.querySelector('.carousel-control-prev');
       const nextControlElm = fixture.nativeElement.querySelector('.carousel-control-next');

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       nextControlElm.click();  // next
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       nextControlElm.click();  // next
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       prevControlElm.click();  // prev
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should not wrap slide changes by when requested', fakeAsync(() => {
       const html = `
      <ngb-carousel [wrap]="false" [enableAnimation]="false">
        <ng-template ngbSlide>foo</ng-template>
        <ng-template ngbSlide>bar</ng-template>
      </ngb-carousel>
    `;

       const fixture = createTestComponent(html);

       const prevControlElm = fixture.nativeElement.querySelector('.carousel-control-prev');
       const nextControlElm = fixture.nativeElement.querySelector('.carousel-control-next');

       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       prevControlElm.click();  // prev
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       nextControlElm.click();  // next
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       nextControlElm.click();  // next
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();
     }));

  it('should change on key arrowRight and arrowLeft', fakeAsync(() => {
       const html = `
        <ngb-carousel [keyboard]="keyboard" [wrap]="false" [enableAnimation]="false">
          <ng-template ngbSlide>foo</ng-template>
          <ng-template ngbSlide>bar</ng-template>
        </ngb-carousel>
      `;

       const fixture = createTestComponent(html);
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       fixture.debugElement.query(By.directive(NgbCarousel)).triggerEventHandler('keydown.arrowRight', {});  // next()
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       fixture.debugElement.query(By.directive(NgbCarousel)).triggerEventHandler('keydown.arrowLeft', {});  // prev()
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       fixture.componentInstance.keyboard = false;
       fixture.detectChanges();
       tick(10);
       fixture.debugElement.query(By.directive(NgbCarousel)).triggerEventHandler('keydown.arrowRight', {});  // prev()
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);


       discardPeriodicTasks();

     }));

  it('should listen to keyevents based on keyboard attribute', fakeAsync(() => {
       const html = `
            <ngb-carousel [keyboard]="keyboard" [enableAnimation]="false">
              <ng-template ngbSlide>foo</ng-template>
              <ng-template ngbSlide>bar</ng-template>
            </ngb-carousel>
          `;

       const fixture = createTestComponent(html);
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       fixture.componentInstance.keyboard = false;
       fixture.detectChanges();
       tick(10);
       fixture.debugElement.query(By.directive(NgbCarousel)).triggerEventHandler('keydown.arrowRight', {});  // prev()
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [true, false]);

       fixture.componentInstance.keyboard = true;
       fixture.detectChanges();
       tick(10);
       fixture.debugElement.query(By.directive(NgbCarousel)).triggerEventHandler('keydown.arrowRight', {});  // next()
       fixture.detectChanges();
       tick(10);
       expectActiveSlides(fixture.nativeElement, [false, true]);

       discardPeriodicTasks();

     }));

  it('should render navigation indicators according to the flags', fakeAsync(() => {
       const html = `
    <ngb-carousel [showNavigationIndicators]="showNavigationIndicators" [enableAnimation]="false">
      <ng-template ngbSlide>foo</ng-template>
    </ngb-carousel>
  `;
       const fixture = createTestComponent(html);

       const slideElms = fixture.nativeElement.querySelectorAll('.carousel-item');
       expect(slideElms.length).toBe(1);
       expect(slideElms[0].textContent).toMatch(/foo/);
       expect(fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li').length).toBe(1);

       fixture.componentInstance.showNavigationIndicators = false;
       fixture.detectChanges();
       tick(10);
       expect(fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li').length).toBe(0);

       discardPeriodicTasks();
     }));

  it('should render navigation buttons according to the flags', fakeAsync(() => {
       const html = `
    <ngb-carousel [showNavigationArrows]="showNavigationArrows" [enableAnimation]="false">
      <ng-template ngbSlide>foo</ng-template>
    </ngb-carousel>
  `;
       const fixture = createTestComponent(html);

       const slideElms = fixture.nativeElement.querySelectorAll('.carousel-item');
       expect(slideElms.length).toBe(1);
       expect(fixture.nativeElement.querySelectorAll('[role="button"]').length).toBe(2);

       fixture.componentInstance.showNavigationArrows = false;
       fixture.detectChanges();
       tick(10);
       expect(fixture.nativeElement.querySelectorAll('[role="button"]').length).toBe(0);

       discardPeriodicTasks();
     }));

  describe('Custom config', () => {
    let config: NgbCarouselConfig;

    beforeEach(() => { TestBed.configureTestingModule({imports: [NgbCarouselModule]}); });

    beforeEach(inject([NgbCarouselConfig], (c: NgbCarouselConfig) => {
      config = c;
      config.enableAnimation = false;
      config.interval = 1000;
      config.wrap = false;
      config.keyboard = false;
      config.pauseOnHover = false;
      config.showNavigationIndicators = true;
      config.showNavigationArrows = true;
    }));

    it('should initialize inputs with provided config', () => {
      const fixture = TestBed.createComponent(NgbCarousel);
      fixture.detectChanges();

      const carousel = fixture.componentInstance;
      expect(carousel.enableAnimation).toBe(config.enableAnimation);
      expect(carousel.interval).toBe(config.interval);
      expect(carousel.wrap).toBe(config.wrap);
      expect(carousel.keyboard).toBe(config.keyboard);
      expect(carousel.pauseOnHover).toBe(config.pauseOnHover);
      expect(carousel.showNavigationIndicators).toBe(config.showNavigationIndicators);
      expect(carousel.showNavigationArrows).toBe(config.showNavigationArrows);
    });
  });

  describe('Custom config as provider', () => {
    const config = new NgbCarouselConfig();
    config.interval = 1000;
    config.wrap = false;
    config.keyboard = false;
    config.pauseOnHover = false;
    config.showNavigationIndicators = true;
    config.showNavigationArrows = true;

    beforeEach(() => {
      TestBed.configureTestingModule(
          {imports: [NgbCarouselModule], providers: [{provide: NgbCarouselConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = TestBed.createComponent(NgbCarousel);
      fixture.detectChanges();

      const carousel = fixture.componentInstance;
      expect(carousel.interval).toBe(config.interval);
      expect(carousel.wrap).toBe(config.wrap);
      expect(carousel.keyboard).toBe(config.keyboard);
      expect(carousel.pauseOnHover).toBe(config.pauseOnHover);
      expect(carousel.showNavigationIndicators).toBe(config.showNavigationIndicators);
      expect(carousel.showNavigationArrows).toBe(config.showNavigationArrows);
    });
  });

});

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  addNewSlide = false;
  interval;
  activeSlideId;
  keyboard = true;
  pauseOnHover = true;
  showNavigationArrows = true;
  showNavigationIndicators = true;
  slides = ['a', 'b'];
  carouselSlideCallBack = (event: NgbSlideEvent) => {};
}

@Component({
  selector: 'test-cmp-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngb-carousel [enableAnimation]="false">
      <ng-template ngbSlide>foo</ng-template>
      <ng-template ngbSlide>bar</ng-template>
    </ngb-carousel>
  `
})
class TestComponentOnPush {
}
