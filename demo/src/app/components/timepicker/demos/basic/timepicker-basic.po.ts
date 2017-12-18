import { browser, by, element, Key, ElementFinder } from 'protractor';

export class TimepickerPage {
  navigateTo() {
    return browser.get('/#/components/timepicker/examples');
  }

  getDemoContainer() {
    return element(by.css('ngbd-timepicker-basic'));
  }

  getWidgetContainer() {
    return this.getDemoContainer().element(by.css('ngb-timepicker'));
  }

  getHourContainer() {
    return this.getWidgetContainer().element(by.css('.ngb-tp-hour'));
  }

  getMinuteContainer() {
    return this.getWidgetContainer().element(by.css('.ngb-tp-minute'));
  }

  getHourInput() {
    return this.getHourContainer().element(by.css('input'));
  }

  getMinuteInput() {
    return this.getMinuteContainer().element(by.css('input'));
  }

  goToNextInput(input) {
    input.sendKeys(Key.TAB);
  }

  goToPreviousInput(input) {
    input.sendKeys(Key.chord(Key.SHIFT, Key.TAB));
  }

  assertInputFocused(input: ElementFinder) {
    const attribute = 'aria-label';

    expect(browser.switchTo().activeElement().getAttribute(attribute)).toEqual(input.getAttribute(attribute));
  }
}
