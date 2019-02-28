import {isNumber, toInteger} from '../util/util';
import { isDefined } from '@angular/compiler/src/util';

export class NgbTime {
  hour: number;
  minute: number;
  second: number;

  constructor(hour?: number, minute?: number, second?: number) {
    this.hour = toInteger(hour);
    this.minute = toInteger(minute);
    this.second = toInteger(second);
  }

  private _update(
    value: number,
    transform: (value: number) => number,
    afterUpdate?: (value: number, transformed: number) => void,
  ) {
    if (!isNumber(value)) { return NaN; }
    const output = transform(value);
    // FIXME 2019-02-28T17:28:32+01:00 It's not really afterUpdate, I should use a method instead of the return value.
    if (isDefined(afterUpdate)) { afterUpdate(value, output); }
    return output;
  }

  private _change(value: number, step = 1) {
    return (isNaN(value) ? 0 : value) + step;
  }

  changeHour(step: number) { this.updateHour(this._change(this.hour, step)); }
  changeMinute(step: number) { this.updateMinute(this._change(this.minute, step)); }
  changeSecond(step: number) { this.updateSecond(this._change(this.second, step)); }

  updateHour(value: number) {
    this.hour = this._update(value, hour => (hour < 0 ? 24 + hour : hour) % 24);
  }

  updateMinute(value: number) {
    this.minute = this._update(
      value,
      minute => minute % 60 < 0 ? 60 + minute % 60 : minute % 60,
      minute => this.changeHour(Math.floor(minute / 60)),
    );
  }

  updateSecond(value: number) {
    this.second = this._update(
      value,
      second => second < 0 ? 60 + second % 60 : second % 60,
      second => this.changeMinute(Math.floor(second / 60)),
    );
  }

  isValid(checkSecs = true) {
    return isNumber(this.hour) && isNumber(this.minute) && (checkSecs ? isNumber(this.second) : true);
  }

  toString() { return `${this.hour || 0}:${this.minute || 0}:${this.second || 0}`; }
}
