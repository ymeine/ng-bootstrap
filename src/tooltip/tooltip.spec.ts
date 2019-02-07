import {TestBed, ComponentFixture, inject, fakeAsync, tick} from '@angular/core/testing';
import {createGenericTestComponent, createKeyEvent} from '../test/common';

import {By} from '@angular/platform-browser';
import {Component, ViewChild, ChangeDetectionStrategy, TemplateRef, ViewContainerRef} from '@angular/core';

import {Key} from '../util/key';

import {NgbTooltipModule} from './tooltip.module';
import {NgbTooltipWindow, NgbTooltip} from './tooltip';
import {NgbTooltipConfig} from './tooltip-config';

function dispatchEscapeKeyUpEvent() {
  document.dispatchEvent(createKeyEvent(Key.Escape));
}

const createTestComponent =
    (html: string) => <ComponentFixture<TestComponent>>createGenericTestComponent(html, TestComponent);

const createOnPushTestComponent =
    (html: string) => <ComponentFixture<TestOnPushComponent>>createGenericTestComponent(html, TestOnPushComponent);

describe('ngb-tooltip-window', () => {
  beforeEach(() => { TestBed.configureTestingModule({imports: [NgbTooltipModule]}); });

  it('should render tooltip on top by default', () => {
    const fixture = TestBed.createComponent(NgbTooltipWindow);
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('tooltip');
    expect(fixture.nativeElement).not.toHaveCssClass('bs-tooltip-top');
    expect(fixture.nativeElement.getAttribute('role')).toBe('tooltip');
  });

  it('should optionally have a custom class', () => {
    const fixture = TestBed.createComponent(NgbTooltipWindow);
    fixture.detectChanges();

    expect(fixture.nativeElement).not.toHaveCssClass('my-custom-class');

    fixture.componentInstance.tooltipClass = 'my-custom-class';
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('my-custom-class');
  });

});

describe('ngb-tooltip', () => {

  let nextId = -1;

  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent, TestOnPushComponent], imports: [NgbTooltipModule]});
    nextId++;
  });

  function getWindow(element) { return element.querySelector('ngb-tooltip-window'); }

  describe('basic functionality', () => {

    it('should open and close a tooltip - default settings and content as string', fakeAsync(() => {
         const fixture = createTestComponent(`<div ngbTooltip="Great tip!" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));
         const defaultConfig = new NgbTooltipConfig();

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('tooltip');
         expect(windowEl).toHaveCssClass(`bs-tooltip-${defaultConfig.placement}`);
         expect(windowEl.textContent.trim()).toBe('Great tip!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-tooltip-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-tooltip-' + nextId);

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should open and close a tooltip - default settings and content from a template', fakeAsync(() => {
         const fixture = createTestComponent(`<ng-template #t>Hello, {{name}}!</ng-template><div [ngbTooltip]="t" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('tooltip');
         expect(windowEl).toHaveCssClass('bs-tooltip-top');
         expect(windowEl.textContent.trim()).toBe('Hello, World!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-tooltip-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-tooltip-' + nextId);

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should open and close a tooltip - default settings, content from a template and context supplied',
       fakeAsync(() => {
         const fixture = createTestComponent(`<ng-template #t let-name="name">Hello, {{name}}!</ng-template><div [ngbTooltip]="t" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.context.tooltip.open({name: 'John'});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('tooltip');
         expect(windowEl).toHaveCssClass('bs-tooltip-top');
         expect(windowEl.textContent.trim()).toBe('Hello, John!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-tooltip-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-tooltip-' + nextId);

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should open and close a tooltip - default settings and custom class', fakeAsync(() => {
         const fixture = createTestComponent(`
        <div ngbTooltip="Great tip!" tooltipClass="my-custom-class" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         const windowEl = getWindow(fixture.nativeElement);

         expect(windowEl).toHaveCssClass('tooltip');
         expect(windowEl).toHaveCssClass('bs-tooltip-top');
         expect(windowEl).toHaveCssClass('my-custom-class');
         expect(windowEl.textContent.trim()).toBe('Great tip!');
         expect(windowEl.getAttribute('role')).toBe('tooltip');
         expect(windowEl.getAttribute('id')).toBe('ngb-tooltip-' + nextId);
         expect(windowEl.parentNode).toBe(fixture.nativeElement);
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBe('ngb-tooltip-' + nextId);

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(directive.nativeElement.getAttribute('aria-describedby')).toBeNull();
       }));

    it('should not open a tooltip if content is falsy', () => {
      const fixture = createTestComponent(`<div [ngbTooltip]="notExisting" [enableAnimation]="false"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toBeNull();
    });

    it('should close the tooltip tooltip if content becomes falsy', fakeAsync(() => {
         const fixture = createTestComponent(`<div [ngbTooltip]="name" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         fixture.componentInstance.name = null;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should not open a tooltip if [disableTooltip] flag', () => {
      const fixture =
          createTestComponent(`<div [ngbTooltip]="Disabled!" [disableTooltip]="true" [enableAnimation]="false"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toBeNull();
    });

    it('should allow re-opening previously closed tooltips', fakeAsync(() => {
         const fixture = createTestComponent(`<div ngbTooltip="Great tip!" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();
       }));

    it('should not leave dangling tooltips in the DOM', fakeAsync(() => {
         const fixture = createTestComponent(
             `<ng-template [ngIf]="show"><div ngbTooltip="Great tip!" [enableAnimation]="false"></div></ng-template>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         fixture.componentInstance.show = false;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    it('should properly cleanup tooltips with manual triggers', fakeAsync(() => {
         const fixture = createTestComponent(`
            <ng-template [ngIf]="show">
              <div ngbTooltip="Great tip!" triggers="manual" #t="ngbTooltip" (mouseenter)="t.open()" [enableAnimation]="false"></div>
            </ng-template>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();

         fixture.componentInstance.show = false;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
       }));

    describe('positioning', () => {

      it('should use requested position', () => {
        const fixture =
            createTestComponent(`<div ngbTooltip="Great tip!" placement="left" [enableAnimation]="false"></div>`);
        const directive = fixture.debugElement.query(By.directive(NgbTooltip));

        directive.triggerEventHandler('mouseenter', {});
        fixture.detectChanges();
        const windowEl = getWindow(fixture.nativeElement);

        expect(windowEl).toHaveCssClass('tooltip');
        expect(windowEl).toHaveCssClass('bs-tooltip-left');
        expect(windowEl.textContent.trim()).toBe('Great tip!');
      });

      it('should properly position tooltips when a component is using the OnPush strategy', () => {
        const fixture =
            createOnPushTestComponent(`<div ngbTooltip="Great tip!" placement="left" [enableAnimation]="false"></div>`);
        const directive = fixture.debugElement.query(By.directive(NgbTooltip));

        directive.triggerEventHandler('mouseenter', {});
        fixture.detectChanges();
        const windowEl = getWindow(fixture.nativeElement);

        expect(windowEl).toHaveCssClass('tooltip');
        expect(windowEl).toHaveCssClass('bs-tooltip-left');
        expect(windowEl.textContent.trim()).toBe('Great tip!');
      });

      it('should have proper arrow placement', () => {
        const fixture =
            createTestComponent(`<div ngbTooltip="Great tip!" placement="right-top" [enableAnimation]="false"></div>`);
        const directive = fixture.debugElement.query(By.directive(NgbTooltip));

        directive.triggerEventHandler('mouseenter', {});
        fixture.detectChanges();
        const windowEl = getWindow(fixture.nativeElement);

        expect(windowEl).toHaveCssClass('tooltip');
        expect(windowEl).toHaveCssClass('bs-tooltip-right');
        expect(windowEl).toHaveCssClass('bs-tooltip-right-top');
        expect(windowEl.textContent.trim()).toBe('Great tip!');
      });

      it('should accept placement in array(second value of the array should be applied)', () => {
        const fixture = createTestComponent(
            `<div ngbTooltip="Great tip!" [placement]="['left-top','top-right']" [enableAnimation]="false"></div>`);
        const directive = fixture.debugElement.query(By.directive(NgbTooltip));

        directive.triggerEventHandler('mouseenter', {});
        fixture.detectChanges();
        const windowEl = getWindow(fixture.nativeElement);

        expect(windowEl).toHaveCssClass('tooltip');
        expect(windowEl).toHaveCssClass('bs-tooltip-top');
        expect(windowEl).toHaveCssClass('bs-tooltip-top-right');
        expect(windowEl.textContent.trim()).toBe('Great tip!');
      });

      it('should apply auto placement', () => {
        const fixture =
            createTestComponent(`<div ngbTooltip="Great tip!" placement="auto" [enableAnimation]="false"></div>`);
        const directive = fixture.debugElement.query(By.directive(NgbTooltip));

        directive.triggerEventHandler('mouseenter', {});
        fixture.detectChanges();
        const windowEl = getWindow(fixture.nativeElement);

        expect(windowEl).toHaveCssClass('tooltip');
        // actual placement with auto is not known in advance, so use regex to check it
        expect(windowEl.getAttribute('class')).toMatch('bs-tooltip-\.');
        expect(windowEl.textContent.trim()).toBe('Great tip!');
      });

    });

    describe('triggers', () => {

      it('should support toggle triggers', fakeAsync(() => {
           const fixture =
               createTestComponent(`<div ngbTooltip="Great tip!" triggers="click" [enableAnimation]="false"></div>`);
           const directive = fixture.debugElement.query(By.directive(NgbTooltip));

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
               `<div ngbTooltip="Great tip!" triggers="mouseenter:click" [enableAnimation]="false"></div>`);
           const directive = fixture.debugElement.query(By.directive(NgbTooltip));

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
               `<div ngbTooltip="Great tip!" triggers="mouseenter:mouseleave click" [enableAnimation]="false"></div>`);
           const directive = fixture.debugElement.query(By.directive(NgbTooltip));

           directive.triggerEventHandler('mouseenter', {});
           fixture.detectChanges();
           tick(10);
           expect(getWindow(fixture.nativeElement)).not.toBeNull();

           directive.triggerEventHandler('click', {});
           fixture.detectChanges();
           tick(10);
           expect(getWindow(fixture.nativeElement)).toBeNull();
         }));

      it('should not use default for manual triggers', () => {
        const fixture =
            createTestComponent(`<div ngbTooltip="Great tip!" triggers="manual" [enableAnimation]="false"></div>`);
        const directive = fixture.debugElement.query(By.directive(NgbTooltip));

        directive.triggerEventHandler('mouseenter', {});
        fixture.detectChanges();
        expect(getWindow(fixture.nativeElement)).toBeNull();
      });

      it('should allow toggling for manual triggers', fakeAsync(() => {
           const fixture = createTestComponent(`
                <div ngbTooltip="Great tip!" triggers="manual" #t="ngbTooltip" [enableAnimation]="false"></div>
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
           const fixture = createTestComponent(`
                <div ngbTooltip="Great tip!" triggers="manual" #t="ngbTooltip" [enableAnimation]="false"></div>
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

      it('should not throw when open called for manual triggers and open tooltip', () => {
        const fixture = createTestComponent(`
                <div ngbTooltip="Great tip!" triggers="manual" #t="ngbTooltip" [enableAnimation]="false"></div>
                <button (click)="t.open()">O</button>`);
        const button = fixture.nativeElement.querySelector('button');

        button.click();  // open
        fixture.detectChanges();
        expect(getWindow(fixture.nativeElement)).not.toBeNull();

        button.click();  // open
        fixture.detectChanges();
        expect(getWindow(fixture.nativeElement)).not.toBeNull();
      });

      it('should not throw when closed called for manual triggers and closed tooltip', () => {
        const fixture = createTestComponent(`
                <div ngbTooltip="Great tip!" triggers="manual" #t="ngbTooltip" [enableAnimation]="false"></div>
                <button (click)="t.close()">C</button>`);

        const button = fixture.nativeElement.querySelector('button');

        button.click();  // close
        fixture.detectChanges();
        expect(getWindow(fixture.nativeElement)).toBeNull();
      });
    });
  });

  describe('container', () => {

    it('should be appended to the element matching the selector passed to "container"', fakeAsync(() => {
         const selector = 'body';
         const fixture = createTestComponent(
             `<div ngbTooltip="Great flop!" container="` + selector + `" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(getWindow(document.querySelector(selector))).not.toBeNull();

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);

       }));

    it('should properly destroy tooltips when the "container" option is used', fakeAsync(() => {
         const selector = 'body';
         const fixture = createTestComponent(
             `<div *ngIf="show" ngbTooltip="Great tip!" container="` + selector + `" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         directive.triggerEventHandler('mouseenter', {});
         fixture.detectChanges();
         tick(10);

         expect(getWindow(document.querySelector(selector))).not.toBeNull();
         fixture.componentRef.instance.show = false;
         fixture.detectChanges();
         tick(10);
         expect(getWindow(document.querySelector(selector))).toBeNull();

         directive.triggerEventHandler('mouseleave', {});
         fixture.detectChanges();
         tick(10);


       }));
  });

  describe('visibility', () => {
    it('should emit events when showing and hiding tooltip', fakeAsync(() => {
         const fixture = createTestComponent(
             `<div ngbTooltip="Great tip!" triggers="click" (shown)="shown()" (hidden)="hidden()" [enableAnimation]="false"></div>`);
         const directive = fixture.debugElement.query(By.directive(NgbTooltip));

         let shownSpy = spyOn(fixture.componentInstance, 'shown');
         let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).not.toBeNull();
         expect(shownSpy).toHaveBeenCalled();

         directive.triggerEventHandler('click', {});
         fixture.detectChanges();
         tick(10);
         expect(getWindow(fixture.nativeElement)).toBeNull();
         expect(hiddenSpy).toHaveBeenCalled();
       }));

    it('should not emit close event when already closed', () => {
      const fixture = createTestComponent(
          `<div ngbTooltip="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()" [enableAnimation]="false"></div>`);

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.tooltip.open();
      fixture.detectChanges();

      fixture.componentInstance.tooltip.open();
      fixture.detectChanges();

      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();
      expect(shownSpy.calls.count()).toEqual(1);
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should not emit open event when already opened', () => {
      const fixture = createTestComponent(
          `<div ngbTooltip="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()" [enableAnimation]="false"></div>`);

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.tooltip.close();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(shownSpy).not.toHaveBeenCalled();
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should report correct visibility', () => {
      const fixture =
          createTestComponent(`<div ngbTooltip="Great tip!" triggers="manual" [enableAnimation]="false"></div>`);
      fixture.detectChanges();

      expect(fixture.componentInstance.tooltip.isOpen()).toBeFalsy();

      fixture.componentInstance.tooltip.open();
      fixture.detectChanges();
      expect(fixture.componentInstance.tooltip.isOpen()).toBeTruthy();

      fixture.componentInstance.tooltip.close();
      fixture.detectChanges();
      expect(fixture.componentInstance.tooltip.isOpen()).toBeFalsy();
    });
  });

  describe('autoClose', () => {
    beforeEach(() => { TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbTooltipModule]}); });

    it('should not close when autoClose is false', fakeAsync(() => {
         const fixture = createTestComponent(`
    <ng-template #tooltipContent><div id="tooltip">Tooltip content</div></ng-template>
    <div
      id="target"
      #tooltip="ngbTooltip"
      [ngbTooltip]="tooltipContent"
      triggers="manual"
      [autoClose]="false"
      (click)="tooltip.open()"
      [enableAnimation]="false"
    >
      Target with tooltip
    </div>
    <div id="outside">Element outside</div>
  `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let tooltip;
         const open = () => {
           target.click();
           tick(16);
           fixture.detectChanges();
           expectToBeOpen();
           tooltip = select('#tooltip');
         };

         open();

         dispatchEscapeKeyUpEvent();
         fixture.detectChanges();
         expectToBeOpen();

         outside.click();
         fixture.detectChanges();
         expectToBeOpen();

         tooltip.click();
         fixture.detectChanges();
         expectToBeOpen();

         target.click();
         fixture.detectChanges();
         expectToBeOpen();
       }));

    it('should close on clicks inside the tooltip and on Escape when autoClose is "inside"', fakeAsync(() => {
         const fixture = createTestComponent(`
        <ng-template #tooltipContent><div id="tooltip">Tooltip content</div></ng-template>
        <div
          id="target"
          #tooltip="ngbTooltip"
          [ngbTooltip]="tooltipContent"
          triggers="manual"
          autoClose="inside"
          (click)="tooltip.open()"
          [enableAnimation]="false"
        >
          Target with tooltip
        </div>
        <div id="outside">Element outside</div>
      `);


         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
         const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let tooltip;
         const open = () => {
           target.click();
           tick(16);
           fixture.detectChanges();
           expectToBeOpen();
           tooltip = select('#tooltip');
         };

         open();

         dispatchEscapeKeyUpEvent();
         fixture.detectChanges();
         tick(10);
         expectToBeClosed();
         open();

         tooltip.click();
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

    it('should close on clicks outside the tooltip and on Escape when autoClose is "outside"', fakeAsync(() => {
         const fixture = createTestComponent(`
        <ng-template #tooltipContent><div id="tooltip">Tooltip content</div></ng-template>
        <div
          id="target"
          #tooltip="ngbTooltip"
          [ngbTooltip]="tooltipContent"
          triggers="manual"
          autoClose="outside"
          (click)="tooltip.open()"
          [enableAnimation]="false"
        >
          Target with tooltip
        </div>
        <div id="outside">Element outside</div>
      `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
         const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let tooltip;
         const open = () => {
           target.click();
           fixture.detectChanges();
           tick(16);
           expectToBeOpen();
           tooltip = select('#tooltip');
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

         tooltip.click();
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
        <ng-template #tooltipContent><div id="tooltip">Tooltip content</div></ng-template>
        <div
          id="target"
          #tooltip="ngbTooltip"
          [ngbTooltip]="tooltipContent"
          triggers="manual"
          [autoClose]="true"
          (click)="tooltip.open()"
          [enableAnimation]="false"
        >
          Target with tooltip
        </div>
        <div id="outside">Element outside</div>
      `);
         const select = selector => fixture.nativeElement.querySelector(selector);
         const expectToBeOpen = () => expect(getWindow(fixture.nativeElement)).not.toBeNull();
         const expectToBeClosed = () => expect(getWindow(fixture.nativeElement)).toBeNull();

         const outside = select('#outside');
         const target = select('#target');
         let tooltip;
         const open = () => {
           target.click();
           tick(16);
           fixture.detectChanges();
           expectToBeOpen();
           tooltip = select('#tooltip');
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

         tooltip.click();
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
    let config: NgbTooltipConfig;

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [NgbTooltipModule]});
      TestBed.overrideComponent(
          TestComponent, {set: {template: `<div ngbTooltip="Great tip!" [enableAnimation]="false"></div>`}});
    });

    beforeEach(inject([NgbTooltipConfig], (c: NgbTooltipConfig) => {
      config = c;
      config.placement = 'bottom';
      config.triggers = 'click';
      config.container = 'body';
      config.tooltipClass = 'my-custom-class';
    }));

    it('should initialize inputs with provided config', () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const tooltip = fixture.componentInstance.tooltip;

      expect(tooltip.placement).toBe(config.placement);
      expect(tooltip.triggers).toBe(config.triggers);
      expect(tooltip.container).toBe(config.container);
      expect(tooltip.tooltipClass).toBe(config.tooltipClass);
    });
  });

  describe('Custom config as provider', () => {
    let config = new NgbTooltipConfig();
    config.placement = 'bottom';
    config.triggers = 'click';
    config.container = 'body';
    config.tooltipClass = 'my-custom-class';

    beforeEach(() => {
      TestBed.configureTestingModule(
          {imports: [NgbTooltipModule], providers: [{provide: NgbTooltipConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = createTestComponent(`<div ngbTooltip="Great tip!" [enableAnimation]="false"></div>`);
      const tooltip = fixture.componentInstance.tooltip;

      expect(tooltip.placement).toBe(config.placement);
      expect(tooltip.triggers).toBe(config.triggers);
      expect(tooltip.container).toBe(config.container);
      expect(tooltip.tooltipClass).toBe(config.tooltipClass);
    });
  });

  describe('non-regression', () => {

    /**
     * Under very specific conditions ngOnDestroy can be invoked without calling ngOnInit first.
     * See discussion in https://github.com/ng-bootstrap/ng-bootstrap/issues/2199 for more details.
     */
    it('should not try to call listener cleanup function when no listeners registered', () => {
      const fixture = createTestComponent(`
        <ng-template #tpl><div ngbTooltip="Great tip!" [enableAnimation]="false"></div></ng-template>
        <button (click)="createAndDestroyTplWithATooltip(tpl)"></button>
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

  @ViewChild(NgbTooltip) tooltip: NgbTooltip;

  shown() {}
  hidden() {}

  constructor(private _vcRef: ViewContainerRef) {}

  createAndDestroyTplWithATooltip(tpl: TemplateRef<any>) {
    this._vcRef.createEmbeddedView(tpl, {}, 0);
    this._vcRef.remove(0);
  }
}

@Component({selector: 'test-onpush-cmpt', changeDetection: ChangeDetectionStrategy.OnPush, template: ``})
export class TestOnPushComponent {
}
