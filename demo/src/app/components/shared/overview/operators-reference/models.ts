export type DefinedOperator =
  'tap'
| 'switchMap'
| 'debounceTime'
| 'distinctUntilChanged'
| 'map'
| 'catchError'
| 'debounce'
| 'timer'
;

export type URLPart = string | boolean | null | undefined;

export interface PartialOperatorReferenceSpec {
  description: string | string[];
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

export interface IOperatorReference {
  name: DefinedOperator;
  description: string[];
  rxjs: OutputURL;
  learnrxjs: OutputURL;
  rxmarbles: OutputURL;
  reactivex: OutputURL;
}

export type OperatorsMap = {
  [key in DefinedOperator]: OperatorReference;
};

function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export class OperatorReference implements IOperatorReference {
  linksCollapsed = true;
  descriptionCollapsed = true;

  constructor(private _spec: OperatorReferenceSpec) {}

  toggleLinksCollapsed() {
    this.linksCollapsed = !this.linksCollapsed;
  }

  toggleDescriptionCollapsed() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

  get moreLinksAvailable(): boolean {
    return this.rxjs != null || this.reactivex != null;
  }

  get name(): DefinedOperator { return this._spec.name; }

  get description(): string[] { return ensureArray(this._spec.description); }

  private _buildUrl(
    value: URLPart,
    buildUrl: (urlPart: string) => string,
    defaultValue = false,
  ): OutputURL {
    if (value === undefined) { value = defaultValue; }
    return value == null || value === false ? null : buildUrl(value === true ? this.name : value);
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
