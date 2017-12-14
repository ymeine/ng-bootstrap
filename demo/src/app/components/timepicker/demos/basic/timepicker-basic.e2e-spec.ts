import { browser, Key } from 'protractor';

import { TimepickerPage } from './timepicker-basic.po';

describe('Timepicker', () => {
  let page: TimepickerPage;

  beforeEach(() => {
    page = new TimepickerPage();
  });

  it('should switch focus from input to input', () => {
    page.navigateTo();

    const hour = page.getHourInput();
    const minute = page.getMinuteInput();

    hour.click();
    page.assertInputFocused(hour, 'hour input should be focused');
    page.goToNextInput(hour);
    page.assertInputFocused(minute, 'minute input should be focused');
    page.goToPreviousInput(minute);
    page.assertInputFocused(hour, 'hour input should be focused');
  });
});
