import {openUrl, expectFocused} from '../../tools.po';

import {Page} from './po';

fdescribe('Timepicker', () => {
  let page: Page;

  beforeAll(() => page = new Page());

  beforeEach(async() => await openUrl('timepicker/navigation'));

  describe('navigation', () => {
    it(`should jump between inputs`, async() => {
      await page.focusInputBefore();
      await page.goNext();
      await expectFocused(page.getField('hour'), 'Hour field should be focused');
      await page.goNext();
      await expectFocused(page.getField('minute'), 'Minute field should be focused');
      await page.goNext();
      await expectFocused(page.getField('second'), 'Second field should be focused');
    });
  });

  describe('arrow keys', () => {
    it(`should keep caret at the end of the input`, async() => {
      await page.focusField('hour');
      await page.pressUp();
      // assert
      await page.pressDown();
      // assert
      await page.goBeginningOfField();
      await page.pressUp();
      // assert
      await page.pressDown();
      // assert
    });
  });
});
