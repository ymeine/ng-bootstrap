export type DefinedOperator =
  'tap'
| 'of'
| 'switchMap'
| 'flatMap'
| 'debounceTime'
| 'distinctUntilChanged'
| 'map'
| 'filter'
| 'catchError'
| 'throwError'
| 'debounce'
| 'timer'
;

export type URLPart = string | boolean | null | undefined;

export interface PartialOperatorReferenceSpec {
  learnrxjs?: URLPart;
  rxmarbles?: URLPart;
  rxjs?: URLPart;
  reactivex?: URLPart;
}

export interface OperatorReferenceSpec extends PartialOperatorReferenceSpec {
  name: DefinedOperator;
}

export type OperatorsSpecMap = {
  [key in DefinedOperator]: PartialOperatorReferenceSpec;
};

export type OutputURL = string | null;

export interface DisplayableLink {
  url: string;
  label: string;
  favorite: boolean;
}

export interface IOperatorReference {
  name: DefinedOperator;
  rxjs: OutputURL;
  learnrxjs: OutputURL;
  rxmarbles: OutputURL;
  reactivex: OutputURL;
}

export type OperatorsMap = {
  [key in DefinedOperator]: OperatorReference;
};

export class OperatorReference implements IOperatorReference {
  constructor(private _spec: OperatorReferenceSpec) {}

  get name(): DefinedOperator { return this._spec.name; }

  private _buildUrl(
    value: URLPart,
    buildUrl: (urlPart: string) => string,
    defaultValue = false,
  ): OutputURL {
    if (value === undefined) { value = defaultValue; }
    return value == null || value === false ? null : buildUrl(value === true ? this.name : value);
  }

  private _buildLinks(specs: [string, OutputURL, boolean?][]): DisplayableLink[] {
    return specs
    .map(([label, url, favorite = false]) => ({label, url, favorite}))
    .filter(({url}) => url != null);
  }

  get links(): DisplayableLink[] {
    return this._buildLinks([
      ['www.learnrxjs.io', this.learnrxjs, true],
      ['rxmarbles.com', this.rxmarbles, true],
      ['rxjs-dev.firebaseapp.com', this.rxjs],
      ['reactivex.io', this.reactivex],
    ]);
  }

  get learnrxjs(): OutputURL {
    return this._buildUrl(
      this._spec.learnrxjs,
      (urlPart) => `https://www.learnrxjs.io/operators/${urlPart}.html`,
    );
  }

  get rxmarbles(): OutputURL {
    return this._buildUrl(
      this._spec.rxmarbles,
      (urlPart) => `http://rxmarbles.com/#${urlPart}`,
    );
  }

  get rxjs(): OutputURL {
    return this._buildUrl(
      this._spec.rxjs,
      (urlPart) => {
        const part = urlPart.includes('/') ? urlPart : `operators/${urlPart}`;
        return `https://rxjs-dev.firebaseapp.com/api/${part}`;
      },
      true,
    );
  }

  get reactivex(): OutputURL {
    return this._buildUrl(
      this._spec.reactivex,
      (urlPart) => `http://reactivex.io/documentation/operators/${urlPart}.html`,
    );
  }
}
