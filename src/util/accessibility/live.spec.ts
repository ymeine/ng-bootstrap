import {
  TestBed,
  ComponentFixture,
  inject,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Live} from './live';



function getLiveElement(): Element {
  return document.body.querySelector('[aria-live]');
}



describe('LiveAnnouncer', () => {
  let live: Live;
  let liveElement: Element;
  let fixture: ComponentFixture<TestComponent>;

  const say = () => {
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    tick(100);
  };

  describe('live announcer', () => {
    beforeEach(() => TestBed.configureTestingModule({
      providers: [Live],
      declarations: [TestComponent],
    }));

    beforeEach(fakeAsync(inject([Live], (_live: Live) => {
      live = _live;
      liveElement = getLiveElement();
      fixture = TestBed.createComponent(TestComponent);
    })));

    afterEach(() => live.ngOnDestroy());

    it('should correctly update the text message', fakeAsync(() => {
      say();
      expect(liveElement.textContent).toBe('test');
    }));

    it('should remove the used element from the DOM on destroy', fakeAsync(() => {
      say();
      live.ngOnDestroy();

      expect(getLiveElement()).toBeFalsy();
    }));

    it('should return a promise that resolves after the text has been announced', fakeAsync(() => {
      const spy = jasmine.createSpy('"say" spy');
      live.say('test').then(spy);

      expect(spy).not.toHaveBeenCalled();
      tick(100);
      expect(spy).toHaveBeenCalled();
    }));
  });
});



@Component({template: `<button (click)="say()">say</button>`})
class TestComponent {
  constructor(public live: Live) { }
  say() { this.live.say('test'); }
}
