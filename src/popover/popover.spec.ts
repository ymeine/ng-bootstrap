import {TestBed, ComponentFixture, inject, fakeAsync, tick} from '@angular/core/testing';
import {createGenericTestComponent, createKeyEvent} from '../test/common';

import {By} from '@angular/platform-browser';
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Injectable,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import {Key} from '../util/key';

import {NgbPopoverModule} from './popover.module';
import {NgbPopoverWindow, NgbPopover} from './popover';
import {NgbPopoverConfig} from './popover-config';

function dispatchEscapeKeyUpEvent() {
  document.dispatchEvent(createKeyEvent(Key.Escape));
}

@Injectable()
class SpyService {
  called = false;
}

const createTestComponent = (html: string) =>
    createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

const createOnPushTestComponent =
    (html: string) => <ComponentFixture<TestOnPushComponent>>createGenericTestComponent(html, TestOnPushComponent);

describe('ngb-popover-window', () => {
  beforeEach(() => { TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule]}); });

  it('should render popover on top by default', () => {
    const fixture = TestBed.createComponent(NgbPopoverWindow);
    fixture.componentInstance.title = 'Test title';
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('popover');
    expect(fixture.nativeElement).not.toHaveCssClass('bs-popover-top');
    expect(fixture.nativeElement.getAttribute('role')).toBe('tooltip');
    expect(fixture.nativeElement.querySelector('.popover-header').textContent).toBe('Test title');
  });

  it('should optionally have a custom class', () => {
    const fixture = TestBed.createComponent(NgbPopoverWindow);
    fixture.detectChanges();

    expect(fixture.nativeElement).not.toHaveCssClass('my-custom-class');

    fixture.componentInstance.popoverClass = 'my-custom-class';
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('my-custom-class');
  });
});

describe('ngb-popover', () => {

  let nextId = -1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, TestOnPushComponent, DestroyableCmpt],
      imports: [NgbPopoverModule],
      providers: [SpyService]
    });
    nextId++;
  });

  function getWindow(element) { return element.querySelector('ngb-popover-window'); }

  describe('basic functionality', () => {

    it('should open and close a popover - default settings and content as string', fakeAsync(() => {
         const fixture =
             createTestComponent(`<div ngbPopover="Great tip!" popoverTitle="Title" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('popover');
         expect(windowEl).toHaveCssClass('bs-popover-top');
         expect(windowEl.textContent.trim()).toBe('TitleGreat tip!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-popover-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-' + nextId);

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should open and close a popover - default settings and content from a template', fakeAsync(() => {
         const fixture = createTestComponent(`
          <ng-template #t>Hello, {{name}}!</ng-template>
          <div [ngbPopover]="t" popoverTitle="Title" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));
         const defaultConfig = new NgbPopoverConfig();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('popover');
         expect(windowEl).toHaveCssClass(`bs-popover-${defaultConfig.placement}`);
         expect(windowEl.textContent.trim()).toBe('TitleHello, World!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-popover-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-' + nextId);

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should open and close a popover - default settings, content from a template and context supplied',
       fakeAsync(() => {
         const fixture = createTestComponent(`
          <ng-template #t let-name="name">Hello, {{name}}!</ng-template>
          <div [ngbPopover]="t" popoverTitle="Title" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));
         const defaultConfig = new NgbPopoverConfig();

         directive.context.popover.open({name: 'John'});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('popover');
         expect(windowEl).toHaveCssClass(`bs-popover-${defaultConfig.placement}`);
         expect(windowEl.textContent.trim()).toBe('TitleHello, John!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-popover-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-' + nextId);

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should open and close a popover - default settings and custom class', fakeAsync(() => {
         const fixture = createTestComponent(`
        <div ngbPopover="Great tip!" popoverTitle="Title" popoverClass="my-custom-class" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('popover');
         expect(windowEl).toHaveCssClass('bs-popover-top');
         expect(windowEl).toHaveCssClass('my-custom-class');
         expect(windowEl.textContent.trim()).toBe('TitleGreat tip!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-popover-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-' + nextId);

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should accept a template for the title and properly destroy it when closing', fakeAsync(() => {
         const fixture = createTestComponent(`
          <ng-template #t>Hello, {{name}}! <destroyable-cmpt></destroyable-cmpt></ng-template>
          <div ngbPopover="Body" [popoverTitle]="t" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));
         const spyService = fixture.debugElement.injector.get(SpyService);

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);
         expect(windowEl.textContent.trim()).toBe('Hello, World! Some contentBody');
         expect(spyService.called).toBeFalsy();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(spyService.called).toBeTruthy();
       }));

    it('should pass the context to the template for the title', fakeAsync(() => {
         const fixture = createTestComponent(`
          <ng-template #t let-greeting="greeting">{{greeting}}, {{name}}!</ng-template>
          <div ngbPopover="!!" [popoverTitle]="t" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         fixture.componentInstance.name = 'tout le monde';
         fixture.componentInstance.popover.open({greeting: 'Bonjour'});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);
         expect(windowEl.textContent.trim()).toBe('Bonjour, tout le monde!!!');

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should properly destroy TemplateRef content', fakeAsync(() => {
         const fixture = createTestComponent(`
          <ng-template #t><destroyable-cmpt></destroyable-cmpt></ng-template>
          <div [ngbPopover]="t" popoverTitle="Title" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));
         const spyService = fixture.debugElement.injector.get(SpyService);

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();
         expect(spyService.called).toBeFalsy();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(spyService.called).toBeTruthy();
       }));

    it('should not show a header if title is empty', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);
      expect(windowEl.querySelector('.popover-header')).toBeNull();
    });

    it('should not open a popover if content and title are empty', () => {
      const fixture = createTestComponent(`<div [ngbPopover]="" [popoverTitle]=""></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toBeNull();
    });

    it('should not open a popover if [disablePopover] flag', () => {
      const fixture = createTestComponent(`<div [ngbPopover]="Disabled!" [disablePopover]="true"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toBeNull();
    });

    it('should close the popover if content and title become empty', fakeAsync(() => {
         const fixture =
             createTestComponent(`<div [ngbPopover]="name" [popoverTitle]="title" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         fixture.componentInstance.name = '';
         fixture.componentInstance.title = '';
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should open the popover if content is empty but title has value', () => {
      const fixture = createTestComponent(`<div [ngbPopover]="" popoverTitle="title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).not.toBeNull();
    });

    it('should not close the popover if content becomes empty but title has value', () => {
      const fixture = createTestComponent(`<div [ngbPopover]="name" popoverTitle="title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.name = '';
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should allow re-opening previously closed popovers', fakeAsync(() => {
         const fixture =
             createTestComponent(`<div ngbPopover="Great tip!" popoverTitle="Title" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();
       }));

    it('should not leave dangling popovers in the DOM', fakeAsync(() => {
         const fixture = createTestComponent(
             `<ng-template [ngIf]="show"><div ngbPopover="Great tip!" popoverTitle="Title" [enableAnimation]="false"></div></ng-template>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         fixture.componentInstance.show = false;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should properly cleanup popovers with manual triggers', fakeAsync(() => {
         const fixture = createTestComponent(`<ng-template [ngIf]="show">
          <div ngbPopover="Great tip!" triggers="manual" #p="ngbPopover" (mouseenter)="p.open()" [enableAnimation]="false"></div>
          </ng-template>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         fixture.componentInstance.show = false;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));
  });


  describe('positioning', () => {

    it('should use requested position', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" placement="left"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass('bs-popover-left');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });

    it('should properly position popovers when a component is using the OnPush strategy', () => {
      const fixture = createOnPushTestComponent(`<div ngbPopover="Great tip!" placement="left"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass('bs-popover-left');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });

    it('should have proper arrow placement', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" placement="right-top"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass('bs-popover-right');
      expect(windowEl).toHaveCssClass('bs-popover-right-top');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });

    it('should accept placement in array(second value of the array should be applied)', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" [placement]="['left-top','top-right']"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass('bs-popover-top');
      expect(windowEl).toHaveCssClass('bs-popover-top-right');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });

    it('should apply auto placement', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" placement="auto"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      // actual placement with auto is not known in advance, so use regex to check it
      expect(windowEl.getAttribute('class')).toMatch('bs-popover-\.');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });

  });

  describe('container', () => {

    it('should be appended to the element matching the selector passed to "container"', fakeAsync(() => {
         const selector = 'body';
         const fixture = createTestComponent(
             `<div ngbPopover="Great tip!" container="` + selector + `" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(getWindow(window.document.querySelector(selector))).not.toBeNull();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(window.document.querySelector(selector))).toBeNull();

       }));

    it('should properly destroy popovers when the "container" option is used', fakeAsync(() => {
         const selector = 'body';
         const fixture = createTestComponent(
             `<div *ngIf="show" ngbPopover="Great tip!" container="` + selector + `" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);

         expect(getWindow(document.querySelector(selector))).not.toBeNull();
         fixture.componentRef.instance.show = false;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(document.querySelector(selector))).toBeNull();
       }));

  });

  describe('visibility', () => {
    it('should emit events when showing and hiding popover', fakeAsync(() => {
         const fixture = createTestComponent(
             `<div ngbPopover="Great tip!" triggers="click" (shown)="shown()" (hidden)="hidden()" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         let shownSpy = spyOn(fixture.componentInstance, 'shown');
         let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(20);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();
         expect(shownSpy).toHaveBeenCalled();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(20);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(hiddenSpy).toHaveBeenCalled();
       }));

    it('should not emit close event when already closed', () => {
      const fixture = createTestComponent(
          `<div ngbPopover="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()"></div>`);

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.popover.open();
      fixture.detectChanges();

      fixture.componentInstance.popover.open();
      fixture.detectChanges();

      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();
      expect(shownSpy.calls.count()).toEqual(1);
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should not emit open event when already opened', () => {
      const fixture = createTestComponent(
          `<div ngbPopover="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()"></div>`);

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.popover.close();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(shownSpy).not.toHaveBeenCalled();
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should report correct visibility', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" triggers="manual"></div>`);
      fixture.detectChanges();

      expect(fixture.componentInstance.popover.isOpen()).toBeFalsy();

      fixture.componentInstance.popover.open();
      fixture.detectChanges();
      expect(fixture.componentInstance.popover.isOpen()).toBeTruthy();

      fixture.componentInstance.popover.close();
      fixture.detectChanges();
      expect(fixture.componentInstance.popover.isOpen()).toBeFalsy();
    });
  });

  describe('triggers', () => {
    beforeEach(() => { TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule]}); });

    it('should support toggle triggers', fakeAsync(() => {
         const fixture =
             createTestComponent(`<div ngbPopover="Great tip!" triggers="click" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should non-default toggle triggers', fakeAsync(() => {
         const fixture = createTestComponent(
             `<div ngbPopover="Great tip!" triggers="mouseenter:click" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should support multiple triggers', fakeAsync(() => {
         const fixture = createTestComponent(
             `<div ngbPopover="Great tip!" triggers="mouseenter:mouseleave click" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should not use default for manual triggers', fakeAsync(() => {
         const fixture =
             createTestComponent(`<div ngbPopover="Great tip!" triggers="manual" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbPopover));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should allow toggling for manual triggers', fakeAsync(() => {
         const fixture = createTestComponent(`
                <div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover" [enableAnimation]="false"></div>
                <button (click)="t.toggle()">T</button>`);
         const button = fixture.nativeElement.querySelector('button');

         button.click();
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         button.click();
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should allow open / close for manual triggers', fakeAsync(() => {
         const fixture = createTestComponent(
             `<div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover" [enableAnimation]="false"></div>
                <button (click)="t.open()">O</button>
                <button (click)="t.close()">C</button>`);
         const buttons = fixture.nativeElement.querySelectorAll('button');

         buttons[0].click();  // open
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         buttons[1].click();  // close
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should not throw when open called for manual triggers and open popover', fakeAsync(() => {
         const fixture = createTestComponent(`
                <div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover" [enableAnimation]="false"></div>
                <button (click)="t.open()">O</button>`);
         const button = fixture.nativeElement.querySelector('button');

         button.click();  // open
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         button.click();  // open
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();
       }));

    it('should not throw when closed called for manual triggers and closed popover', fakeAsync(() => {
         const fixture = createTestComponent(`
                <div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover" [enableAnimation]="false"></div>
                <button (click)="t.close()">C</button>`);
         const button = fixture.nativeElement.querySelector('button');

         button.click();  // close
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));
  });

  describe('autoClose', () => {
    beforeEach(() => { TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule]}); });

    it('should not close when autoClose is false', fakeAsync(() => {
         const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          [autoClose]="false"
          (click)="popover.open()"
        >
          Target with popover
        </div>
        <div id="outside">Element outside</div>
      `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let popover;
         const open = () => {
           target.click();
           tick(16);
           fixture.detectChanges();
           expectToBeOpen();
           popover = select('#popover');
         };

         open();

         dispatchEscapeKeyUpEvent();
         fixture.detectChanges();
         expectToBeOpen();

         outside.click();
         fixture.detectChanges();
         expectToBeOpen();

         popover.click();
         fixture.detectChanges();
         expectToBeOpen();

         target.click();
         fixture.detectChanges();
         expectToBeOpen();
       }));

    it('should close on clicks inside the popover and on Escape when autoClose is "inside"', fakeAsync(() => {
         const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          autoClose="inside"
          (click)="popover.open()"
          [enableAnimation]="false"
        >
          Target with popover
        </div>
        <div id="outside">Element outside</div>
      `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
         const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let popover;
         const open = () => {
           target.click();
           tick(16);
           fixture.detectChanges();
           tick(10);
           expectToBeOpen();
           popover = select('#popover');
         };

         open();

         dispatchEscapeKeyUpEvent();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         popover.click();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         outside.click();
         fixture.detectChanges();
         tick(10);
         expectToBeOpen();

         target.click();
         fixture.detectChanges();
         tick(10);
         expectToBeOpen();
       }));

    it('should close on clicks outside the popover and on Escape when autoClose is "outside"', fakeAsync(() => {
         const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          autoClose="outside"
          (click)="popover.open()"
          [enableAnimation]="false"
        >
          Target with popover
        </div>
        <div id="outside">Element outside</div>
      `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
         const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let popover;
         const open = () => {
           target.click();
           fixture.detectChanges();
           tick(16);
           expectToBeOpen();
           popover = select('#popover');
         };

         open();

         dispatchEscapeKeyUpEvent();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         outside.click();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         popover.click();
         fixture.detectChanges();
         tick(10);
         expectToBeOpen();

         target.click();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
       }));

    it('should close on clicks anywhere and on Escape when autoClose is true', fakeAsync(() => {
         const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          [autoClose]="true"
          (click)="popover.open()"
          [enableAnimation]="false"
        >
          Target with popover
        </div>
        <div id="outside">Element outside</div>
      `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
         const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let popover;
         const open = () => {
           target.click();
           tick(16);
           fixture.detectChanges();
           tick(10);
           expectToBeOpen();
           popover = select('#popover');
         };

         open();

         dispatchEscapeKeyUpEvent();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         outside.click();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         popover.click();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         target.click();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
       }));
  });

  describe('Custom config', () => {
    let config: NgbPopoverConfig;

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [NgbPopoverModule]});
      TestBed.overrideComponent(TestComponent, {set: {template: `<div ngbPopover="Great tip!"></div>`}});
    });

    beforeEach(inject([NgbPopoverConfig], (c: NgbPopoverConfig) => {
      config = c;
      config.placement = 'bottom';
      config.triggers = 'hover';
      config.container = 'body';
      config.popoverClass = 'my-custom-class';
    }));

    it('should initialize inputs with provided config', () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
      expect(popover.container).toBe(config.container);
      expect(popover.popoverClass).toBe(config.popoverClass);
    });
  });

  describe('Custom config as provider', () => {
    let config = new NgbPopoverConfig();
    config.placement = 'bottom';
    config.triggers = 'hover';
    config.popoverClass = 'my-custom-class';

    beforeEach(() => {
      TestBed.configureTestingModule(
          {imports: [NgbPopoverModule], providers: [{provide: NgbPopoverConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!"></div>`);
      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
      expect(popover.popoverClass).toBe(config.popoverClass);
    });
  });

  describe('non-regression', () => {

    /**
     * Under very specific conditions ngOnDestroy can be invoked without calling ngOnInit first.
     * See discussion in https://github.com/ng-bootstrap/ng-bootstrap/issues/2199 for more details.
     */
    it('should not try to call listener cleanup function when no listeners registered', () => {
      const fixture = createTestComponent(`
         <ng-template #tpl><div ngbPopover="Great tip!"></div></ng-template>
         <button (click)="createAndDestroyTplWithAPopover(tpl)"></button>
       `);
      const buttonEl = fixture.debugElement.query(By.css('button'));
      buttonEl.triggerEventHandler('click', {});
    });
  });
});

@Component({selector: 'test-cmpt', template: ``})
export class TestComponent {
  name = 'World';
  show = true;
  title: string;
  placement: string;

  @ViewChild(NgbPopover) popover: NgbPopover;

  constructor(private _vcRef: ViewContainerRef) {}

  createAndDestroyTplWithAPopover(tpl: TemplateRef<any>) {
    this._vcRef.createEmbeddedView(tpl, {}, 0);
    this._vcRef.remove(0);
  }

  shown() {}
  hidden() {}
}

@Component({selector: 'test-onpush-cmpt', changeDetection: ChangeDetectionStrategy.OnPush, template: ``})
export class TestOnPushComponent {
}

@Component({selector: 'destroyable-cmpt', template: 'Some content'})
export class DestroyableCmpt implements OnDestroy {
  constructor(private _spyService: SpyService) {}

  ngOnDestroy(): void { this._spyService.called = true; }
}
