import {$, Key} from 'protractor';

import {sendKey} from '../../tools.po';

export type Field = 'hour' | 'minute' | 'second';

export class Page {
  getInputBefore() { return $('#before'); }
  focusInputBefore() { return this.getInputBefore().click(); }

  getField(field: Field) { return $(`.ngb-tp-${field} > input`); }
  focusField(field: Field) { return this.getField(field).click(); }

  goNext() { return sendKey(Key.TAB); }
  goPrevious() { return sendKey(Key.SHIFT, Key.TAB); }

  pressUp() { return sendKey(Key.ARROW_UP); }
  pressDown() { return sendKey(Key.ARROW_DOWN); }

  goBeginningOfField() { return sendKey(Key.HOME); }

  getFieldCaretPosition(field: Field) {
    //this.getField(field);
  }
}
