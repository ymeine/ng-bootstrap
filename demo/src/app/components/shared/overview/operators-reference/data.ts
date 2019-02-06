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
  of: {
    rxjs: 'index/function/of',
    learnrxjs: 'creation/of',
    rxmarbles: true,
  },
  switchMap: {
    learnrxjs: 'transformation/switchmap',
    rxmarbles: true,
    // reactivex: 'flatmap',
  },
  flatMap: {
    learnrxjs: 'transformation/flatmap',
    rxmarbles: true,
    reactivex: true,
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
  filter: {
    learnrxjs: 'filtering/filter',
    rxmarbles: true,
    reactivex: true,
  },
  catchError: {
    learnrxjs: 'error_handling/catch',
    reactivex: 'catch',
  },
  throwError: {
    rxjs: 'index/function/throwError',
    learnrxjs: 'creation/throw',
    reactivex: 'empty-never-throw',
  },
};

export const operators: OperatorsMap = Object.keys(operatorsSpecs)
.map((name) => new OperatorReference(Object.assign({}, {name}, operatorsSpecs[name])))
.reduce((output, operator) => Object.assign(output, {[operator.name]: operator}), {}) as OperatorsMap
;
