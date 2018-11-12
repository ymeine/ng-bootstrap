import {
  OperatorReference,
  OperatorsMap,
  OperatorsSpecMap,
} from './models';



const operatorsSpecs: OperatorsSpecMap = {
  tap: {
    description: `Performs a side-effect when a new value is emitted,
    passing the value as is through the next operator in the chain.`,
    learnrxjs: 'utility/do',
    reactivex: 'do',
  },
  switchMap: {
    description: [
      `Switches the stream to the returned <code>Observable</code>.`,
      `If the previously returned <code>Observable</code> hasn't completed yet,
      will cancel it before using the new one.`,
    ],
    learnrxjs: 'transformation/switchmap',
    rxmarbles: true,
    // reactivex: 'flatmap',
  },
  debounceTime: {
    description: [
      `Ensures the next value is emitted only after the given time has passed
      without any other value has been emitted in the meantime.`,
      `That means that there will always be a delay between the original emission and the final one.`,
      `This also means that if there's always a new value emitted before the delay completes, no value will ever be emitted.`,
    ],
    learnrxjs: 'filtering/debouncetime',
    rxmarbles: true,
  },
  debounce: {
    description: [
      `Similar to <code>debounceTime</code>, but instead of having a fixed time,
      uses a function returning an <code>Observable</code> which will unblock the value after it emits once.`,
      `In other words, the delay is the time between the call of the
      function/creation of the <code>Observable</code> and its first emission.`,
      `Classic <code>Observable</code> creation operators used for that are <code>timer</code> or <code>interval</code>.`,
    ],
    learnrxjs: 'filtering/debounce',
    rxmarbles: true,
    reactivex: true,
  },
  timer: {
    description: [
      `Creates an <code>Observable</code> emitting a sequence of numbers, using the specified interval, if provided.`,
      `Contrary to <code>interval</code>, it also allows to specify the time of the first emission.`,
      `Therefore, <code>timer(delay)</code> will emit once after delay time and then complete.`,
    ],
    rxjs: 'index/function/timer',
    learnrxjs: 'creation/timer',
    rxmarbles: true,
    reactivex: true,
  },
  distinctUntilChanged: {
    description: `Passes the newly emitted value through only if it is different from the previous one.`,
    learnrxjs: 'filtering/distinctuntilchanged',
    rxmarbles: true,
    reactivex: 'distinct',
  },
  map: {
    description: `Transforms the emitted value into a new one.`,
    learnrxjs: 'transformation/map',
    rxmarbles: true,
    reactivex: true,
  },
  catchError: {
    description: [
      `Switches the <code>Observable</code> when an error occurs on the source one.`,
      `If no error occurs, just passes the value through as is.`,
    ],
    learnrxjs: 'error_handling/catch',
    reactivex: 'catch',
  },
};

export const operators: OperatorsMap = Object.keys(operatorsSpecs)
.map((name) => new OperatorReference(Object.assign({}, {name}, operatorsSpecs[name])))
.reduce((output, operator) => Object.assign(output, {[operator.name]: operator}), {}) as OperatorsMap
;
