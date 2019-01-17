import {
  OperatorReference,
  OperatorsMap,
  OperatorsSpecMap,
} from './models';



const operatorsSpecs: OperatorsSpecMap = {
  tap: {
    learnrxjs: 'utility/do',
    reactivex: 'do',
  },
  switchMap: {
    learnrxjs: 'transformation/switchmap',
    rxmarbles: true,
    // reactivex: 'flatmap',
  },
  debounceTime: {
    learnrxjs: 'filtering/debouncetime',
    rxmarbles: true,
  },
  debounce: {
    learnrxjs: 'filtering/debounce',
    rxmarbles: true,
    reactivex: true,
  },
  timer: {
    rxjs: 'index/function/timer',
    learnrxjs: 'creation/timer',
    rxmarbles: true,
    reactivex: true,
  },
  distinctUntilChanged: {
    learnrxjs: 'filtering/distinctuntilchanged',
    rxmarbles: true,
    reactivex: 'distinct',
  },
  map: {
    learnrxjs: 'transformation/map',
    rxmarbles: true,
    reactivex: true,
  },
  catchError: {
    learnrxjs: 'error_handling/catch',
    reactivex: 'catch',
  },
};

export const operators: OperatorsMap = Object.keys(operatorsSpecs)
.map((name) => new OperatorReference(Object.assign({}, {name}, operatorsSpecs[name])))
.reduce((output, operator) => Object.assign(output, {[operator.name]: operator}), {}) as OperatorsMap
;
