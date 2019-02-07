import {
  Observable,
  timer,
} from 'rxjs';

import {
  debounce,
  distinctUntilChanged,
} from 'rxjs/operators';



export function customDebounce<T>(getTime: () => number): (observable: Observable<T>) => Observable<T> {
  return (observable) => observable.pipe(
    debounce(() => timer(getTime())),
    distinctUntilChanged(),
  );
}



export interface Color {
  name: string;
  hexCode: string;
}

export const FULL_COLORS: Color[] = [
  {name: 'black', hexCode: '000000'},
  {name: 'white', hexCode: 'FFFFFF'},
  {name: 'red', hexCode: 'FF0000'},
  {name: 'green', hexCode: '008000'},
  {name: 'yellow', hexCode: 'FFFF00'},
  {name: 'blue', hexCode: '0000FF'},
  {name: 'brown', hexCode: 'A52A2A'},
  {name: 'orange', hexCode: 'FFA500'},
  {name: 'pink', hexCode: 'FFC0CB'},
  {name: 'purple', hexCode: '800080'},
  {name: 'grey', hexCode: '808080'},
];

export const COLORS = FULL_COLORS.map(({name}) => name);



export function getResults(term: string) {
  return term === '' ? COLORS : COLORS.filter(color => color.toLowerCase().startsWith(term.toLowerCase()));
}
