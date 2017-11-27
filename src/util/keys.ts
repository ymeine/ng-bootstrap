import {isDefined}from './util';



interface KeySpec {
  customName?: string;
  key: string;
  keyIE?: string;
  keyCode: number;
}

export const keySpecs: KeySpec[] = [
  {key: 'Tab', keyCode: 9},
  {key: 'Enter', keyCode: 13},
  {key: 'Escape', keyIE: 'Esc', keyCode: 27},
  {customName: 'Space', key: ' ', keyIE: 'Spacebar', keyCode: 32},

  {key: 'PageUp', keyCode: 33},
  {key: 'PageDown', keyCode: 34},
  {key: 'End', keyCode: 35},
  {key: 'Home', keyCode: 36},

  {key: 'ArrowLeft', keyIE: 'Left', keyCode: 37},
  {key: 'ArrowUp', keyIE: 'Up', keyCode: 38},
  {key: 'ArrowRight', keyIE: 'Right', keyCode: 39},
  {key: 'ArrowDown', keyIE: 'Down', keyCode: 40}
];

const keyCodesToSpec = {};
keySpecs.forEach(spec => {
  const {keyCode} = spec;
  keyCodesToSpec[keyCode] = spec;
});

const keysToSpec = {};
keySpecs.forEach(spec => {
  const {key, keyIE} = spec;
  keysToSpec[key] = spec;
  if (isDefined(keyIE)) {
    keysToSpec[keyIE] = spec;
  }
});



export function getKeySpec(event: KeyboardEvent): KeySpec {
  const {key, keyCode, which} = event;

  let spec = null;

  if (isDefined(key)) {
    spec = keysToSpec[key];
  }

  if (!isDefined(spec)) {
    const code = isDefined(keyCode) ? keyCode : isDefined(which) ? which : null;
    if (isDefined(code)) {
      spec = keyCodesToSpec[code];
    }
  }

  return spec;
}

export function getKey(event: KeyboardEvent): string {
  const spec = getKeySpec(event);
  const key = isDefined(spec) ? spec.key : null;
  return key;
}

export function getKeyCode(event: KeyboardEvent): number {
  const spec = getKeySpec(event);
  const code = isDefined(spec) ? spec.keyCode : null;
  return code;
}

export function getKeyName(event: KeyboardEvent): string {
  const spec = getKeySpec(event);
  let name = null;
  if (isDefined(spec)) {
    const {customName, key} = spec;
    name = isDefined(customName) ? customName : key;
  }
  return name;
}



export function checkKey(name: string, event: KeyboardEvent): boolean { return getKeyName(event) === name; }


export function isTab(event: KeyboardEvent): boolean { return checkKey('Tab', event); }
export function isEnter(event: KeyboardEvent): boolean { return checkKey('Enter', event); }
export function isEscape(event: KeyboardEvent): boolean { return checkKey('Escape', event); }
export function isSpace(event: KeyboardEvent): boolean { return checkKey('Space', event); }


export function isPageUp(event: KeyboardEvent): boolean { return checkKey('PageUp', event); }
export function isPageDown(event: KeyboardEvent): boolean { return checkKey('PageDown', event); }
export function isEnd(event: KeyboardEvent): boolean { return checkKey('End', event); }
export function isHome(event: KeyboardEvent): boolean { return checkKey('Home', event); }


export function isArrowLeft(event: KeyboardEvent): boolean { return checkKey('ArrowLeft', event); }
export function isArrowUp(event: KeyboardEvent): boolean { return checkKey('ArrowUp', event); }
export function isArrowRight(event: KeyboardEvent): boolean { return checkKey('ArrowRight', event); }
export function isArrowDown(event: KeyboardEvent): boolean { return checkKey('ArrowDown', event); }
