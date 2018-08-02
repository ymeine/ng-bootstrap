import {TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {createGenericTestComponent, createKeyEvent} from '../test/common';

import {By} from '@angular/platform-browser';
import {Component, ViewChild, ChangeDetectionStrategy, Injectable, OnDestroy} from '@angular/core';

import {Key} from '../util/key';

import {NgbPopoverModule} from './popover.module';
import {NgbPopoverWindow, NgbPopover} from './popover';
import {NgbPopoverConfig} from './popover-config';

function dispatchEscapeKeyUpEvent() {
  document.dispatchEvent(createKeyEvent(Key.Escape));
};

@Injectable()
class SpyService {
  called = false;
}

const createTestComponent = (html: string) =>
    createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

const createOnPushTestComponent =
    (html: string) => <ComponentFixture<TestOnPushComponent>>createGenericTestComponent(html, TestOnPushComponent);

describe('ngb-popover-window', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule.forRoot()]});
  });

  it('should render popover on top by default', () => {
    const fixture = TestBed.createComponent(NgbPopoverWindow);
    fixture.componentInstance.title = 'Test title';
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('popover');
    expect(fixture.nativeElement).toHaveCssClass('bs-popover-top');
    expect(fixture.nativeElement.getAttribute('role')).toBe('tooltip');
    expect(fixture.nativeElement.querySelector('.popover-header').textContent).toBe('Test title');
  });

  it('should position popovers as requested', () => {
    const fixture = TestBed.createComponent(NgbPopoverWindow);
    fixture.componentInstance.placement = 'left';
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveCssClass('bs-popover-left');
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, TestOnPushComponent, DestroyableCmpt],
      imports: [NgbPopoverModule.forRoot()],
      providers: [SpyService]
    });
  });

  function getWindow(element) { return element.querySelector('ngb-popover-window'); }

  describe('basic functionality', () => {

    it('should open and close a popover - default settings and content as string', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" popoverTitle="Title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass('bs-popover-top');
      expect(windowEl.textContent.trim()).toBe('TitleGreat tip!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toBe('ngb-popover-0');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-0');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
    });

    it('should open and close a popover - default settings and content from a template', () => {
      const fixture = createTestComponent(`
          <ng-template #t>Hello, {{name}}!</ng-template>
          <div [ngbPopover]="t" popoverTitle="Title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));
      const defaultConfig = new NgbPopoverConfig();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass(`bs-popover-${defaultConfig.placement}`);
      expect(windowEl.textContent.trim()).toBe('TitleHello, World!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toBe('ngb-popover-1');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-1');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
    });

    it('should open and close a popover - default settings, content from a template and context supplied', () => {
      const fixture = createTestComponent(`
          <ng-template #t let-name="name">Hello, {{name}}!</ng-template>
          <div [ngbPopover]="t" popoverTitle="Title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));
      const defaultConfig = new NgbPopoverConfig();

      directive.context.popover.open({name: 'John'});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass(`bs-popover-${defaultConfig.placement}`);
      expect(windowEl.textContent.trim()).toBe('TitleHello, John!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toBe('ngb-popover-2');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-2');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
    });

    it('should open and close a popover - default settings and custom class', () => {
      const fixture = createTestComponent(`
        <div ngbPopover="Great tip!" popoverTitle="Title" popoverClass="my-custom-class"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popover');
      expect(windowEl).toHaveCssClass('bs-popover-top');
      expect(windowEl).toHaveCssClass('my-custom-class');
      expect(windowEl.textContent.trim()).toBe('TitleGreat tip!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toBe('ngb-popover-3');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-popover-3');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
    });

    it('should properly destroy TemplateRef content', () => {
      const fixture = createTestComponent(`
          <ng-template #t><destroyable-cmpt></destroyable-cmpt></ng-template>
          <div [ngbPopover]="t" popoverTitle="Title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));
      const spyService = fixture.debugElement.injector.get(SpyService);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(spyService.called).toBeFalsy();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(spyService.called).toBeTruthy();
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

    it('should close the popover if content and title become empty', () => {
      const fixture = createTestComponent(`<div [ngbPopover]="name" [popoverTitle]="title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.name = '';
      fixture.componentInstance.title = '';
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

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

    it('should allow re-opening previously closed popovers', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" popoverTitle="Title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should not leave dangling popovers in the DOM', () => {
      const fixture = createTestComponent(
          `<ng-template [ngIf]="show"><div ngbPopover="Great tip!" popoverTitle="Title"></div></ng-template>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should properly cleanup popovers with manual triggers', () => {
      const fixture = createTestComponent(`<ng-template [ngIf]="show">
                                            <div ngbPopover="Great tip!" triggers="manual" #p="ngbPopover" (mouseenter)="p.open()"></div>
                                        </ng-template>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
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

    it('should be appended to the element matching the selector passed to "container"', () => {
      const selector = 'body';
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(getWindow(window.document.querySelector(selector))).not.toBeNull();
    });

    it('should properly destroy popovers when the "container" option is used', () => {
      const selector = 'body';
      const fixture =
          createTestComponent(`<div *ngIf="show" ngbPopover="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();

      expect(getWindow(document.querySelector(selector))).not.toBeNull();
      fixture.componentRef.instance.show = false;
      fixture.detectChanges();
      expect(getWindow(document.querySelector(selector))).toBeNull();
    });

  });

  describe('visibility', () => {
    it('should emit events when showing and hiding popover', () => {
      const fixture = createTestComponent(
          `<div ngbPopover="Great tip!" triggers="click" (shown)="shown()" (hidden)="hidden()"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(hiddenSpy).toHaveBeenCalled();
    });

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
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule.forRoot()]});
    });

    it('should support toggle triggers', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" triggers="click"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should non-default toggle triggers', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" triggers="mouseenter:click"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should support multiple triggers', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" triggers="mouseenter:mouseleave click"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not use default for manual triggers', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" triggers="manual"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow toggling for manual triggers', () => {
      const fixture = createTestComponent(`
                <div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover"></div>
                <button (click)="t.toggle()" [ngbPopoverIgnoreAutoClose]="t">T</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow open / close for manual triggers', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover"></div>
                <button (click)="t.open()" [ngbPopoverIgnoreAutoClose]="t">O</button>
                <button (click)="t.close()">C</button>`);
      const buttons = fixture.nativeElement.querySelectorAll('button');

      buttons[0].click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      buttons[1].click();  // close
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not throw when open called for manual triggers and open popover', () => {
      const fixture = createTestComponent(`
                <div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover"></div>
                <button (click)="t.open()" [ngbPopoverIgnoreAutoClose]="t">O</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      button.click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should not throw when closed called for manual triggers and closed popover', () => {
      const fixture = createTestComponent(`
                <div ngbPopover="Great tip!" triggers="manual" #t="ngbPopover"></div>
                <button (click)="t.close()">C</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();  // close
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
  });

  describe('autoClose', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule.forRoot()]});
    });

    it('should not close when autoClose is false', () => {
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
    });

    it('should close on clicks inside the popover and on Escape when autoClose is "inside"', () => {
      const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          autoClose="inside"
          (click)="popover.open()"
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
        expectToBeOpen();
        popover = select('#popover');
      };

      open();

      dispatchEscapeKeyUpEvent();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      popover.click();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      outside.click();
      fixture.detectChanges();
      expectToBeOpen();

      target.click();
      fixture.detectChanges();
      expectToBeOpen();
    });

    it('should close on clicks outside the popover and on Escape when autoClose is "outside"', () => {
      const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          autoClose="outside"
          (click)="popover.open()"
          [ngbPopoverIgnoreAutoClose]="popover"
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
        expectToBeOpen();
        popover = select('#popover');
      };

      open();

      dispatchEscapeKeyUpEvent();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      outside.click();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      popover.click();
      fixture.detectChanges();
      expectToBeOpen();

      target.click();
      fixture.detectChanges();
      expectToBeOpen();
    });

    it('should close on clicks anywhere and on Escape when autoClose is true', () => {
      const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          #popover="ngbPopover"
          [ngbPopover]="popoverContent"
          triggers="manual"
          [autoClose]="true"
          (click)="popover.open()"
          [ngbPopoverIgnoreAutoClose]="popover"
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
        expectToBeOpen();
        popover = select('#popover');
      };

      open();

      dispatchEscapeKeyUpEvent();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      outside.click();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      popover.click();
      fixture.detectChanges();
      expectToBeClosed();
      open();

      target.click();
      fixture.detectChanges();
      expectToBeOpen();
    });

    it('should implicitly ignore popover target when using a trigger with a click: for toggler', () => {
      const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          [ngbPopover]="popoverContent"
          triggers="keydown:keyup click"
          [autoClose]="true"
        >
          Target with popover
        </div>
        <div id="outside">Element outside</div>
      `);
      const select = selector => fixture.nativeElement.querySelector(selector);
      const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
      const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

      const target = select('#target');
      const open = () => {
        target.click();
        fixture.detectChanges();
        expectToBeOpen();
      };

      open();

      target.click();
      fixture.detectChanges();
      expectToBeClosed();
    });

    it('should implicitly ignore popover target when using a trigger with a click: for opener', () => {
      const fixture = createTestComponent(`
        <ng-template #popoverContent><div id="popover">Popover content</div></ng-template>
        <div
          id="target"
          [ngbPopover]="popoverContent"
          triggers="keydown:keyup click:keyup"
          [autoClose]="true"
        >
          Target with popover
        </div>
        <div id="outside">Element outside</div>
      `);
      const select = selector => fixture.nativeElement.querySelector(selector);
      const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();

      const target = select('#target');
      const open = () => {
        target.click();
        fixture.detectChanges();
        expectToBeOpen();
      };

      open();

      target.click();
      fixture.detectChanges();
      expectToBeOpen();
    });

    it('should explicitly ignore manually marked elements', () => {
      const fixture = createTestComponent(`
        <ng-template #popoverContent>
          <div id="popover-ignored" [ngbPopoverIgnoreAutoClose]="popover">Popover content</div>
          <div id="popover-closer">Close me</div>
        </ng-template>
        <div
          id="target"
          [ngbPopover]="popoverContent"
          triggers="manual"
          [autoClose]="true"
          (click)="popover.open()"
          [ngbPopoverIgnoreAutoClose]="popover"
        >
          Target with popover
        </div>
        <div id="outside" [ngbPopoverIgnoreAutoClose]="popover">Element outside</div>
      `);
      const select = selector => fixture.nativeElement.querySelector(selector);
      const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
      const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

      const outside = select('#outside');
      const target = select('#target');
      let popoverIgnored;
      let popoverCloser;
      const open = () => {
        target.click();
        fixture.detectChanges();
        expectToBeOpen();
        popoverIgnored = select('#popover-ignored');
        popoverCloser = select('#popover-closer');
      };

      open();

      outside.click();
      fixture.detectChanges();
      expectToBeOpen();

      target.click();
      fixture.detectChanges();
      expectToBeOpen();

      popoverIgnored.click();
      fixture.detectChanges();
      expectToBeOpen();

      popoverCloser.click();
      fixture.detectChanges();
      expectToBeClosed();
    });
  });

  describe('Custom config', () => {
    let config: NgbPopoverConfig;

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [NgbPopoverModule.forRoot()]});
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
          {imports: [NgbPopoverModule.forRoot()], providers: [{provide: NgbPopoverConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!"></div>`);
      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
      expect(popover.popoverClass).toBe(config.popoverClass);
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
