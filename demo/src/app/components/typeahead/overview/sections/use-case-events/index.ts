import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';

import {
  Observable,
  Subject,
  merge,
  timer,
  of,
} from 'rxjs';

import {
  map,
  filter,
  tap,
  delay,
  finalize,
  delayWhen,
} from 'rxjs/operators';

import {
  NgbTypeahead,
} from '@ng-bootstrap/ng-bootstrap';

import {
  customDebounce,
  STYLES,
  COLORS,
} from '../../common';

import {SNIPPETS} from './snippets';



type AlwaysTapCallback<T> = (value?: T) => void;
type AlwaysTapOutput<T> = (observable$: Observable<T>) => Observable<T>;

const alwaysTap = <T>(callback: AlwaysTapCallback<T>): AlwaysTapOutput<T> => (observable$) => {
  let executed = false;

  return observable$.pipe(
    tap(value => {
      callback(value);
      executed = true;
    }),
    finalize(() => {
      if (!executed) { callback(); }
      executed = false;
    }),
  );
};

type SearchSource = 'programmatic' | 'input' | 'click' | 'focus';

@Component({
  selector: 'ngbd-typeahead-overview-section-use-case-events',
  templateUrl: './template.html',
  styles: [STYLES],
})
export class NgbdTypeaheadOverviewSectionUseCaseEventsComponent {
  model: string;
  debounceTime = 200;

  opensOnFocus = true;
  opensOnClick = true;
  simulatesSearchDelay = true;

  searchSource: null | SearchSource;

  snippets = SNIPPETS;

  @ViewChild('instance') private _instance: NgbTypeahead;
  @ViewChild('input') private _input: ElementRef<HTMLInputElement>;
  private _inputFocus$ = new Subject<string>();
  private _inputClick$ = new Subject<string>();
  private _programmatic$ = new Subject<string>();

  private _searching = false;
  private _justBlurred = false;

  constructor(private _changeDetector: ChangeDetectorRef) {
    this._initProperties();
  }

  private _initProperties() {
    this.searchSource = null;
    this.opensOnFocus = true;
    this.opensOnClick = true;
    this.simulatesSearchDelay = true;
    this.model = '';
    this.debounceTime = 200;
  }

  initializeTypeahead = (text$: Observable<string>): Observable<string[]> => {
    const searchSources: Observable<{term: string, source: SearchSource}>[] = [
      this._programmatic$.pipe(
        // the delay of 0 is used to prevent any click event to automatically close the popup
        // therefore we launch every search after a delay, in case
        delay(0),
        map(term => ({term, source: 'programmatic' as SearchSource})),
      ),

      text$.pipe(
        customDebounce(() => this.debounceTime),
        map(term => ({term, source: 'input' as SearchSource})),
      ),

      this._inputClick$.pipe(
        filter(() => this.opensOnClick && this._shouldOpenOnClickOrFocus()),
        map(term => ({term, source: 'click' as SearchSource})),
      ),

      this._inputFocus$.pipe(
        filter(() => this.opensOnFocus && this._shouldOpenOnClickOrFocus()),
        map(term => ({term, source: 'focus' as SearchSource})),
      ),
    ];

    return merge(...searchSources).pipe(
      tap(({source}) => {
        this._searching = true;
        this.searchSource = source;
        this._update();
      }),
      map(({term}) => this._getResults(term)),
      delayWhen(() => this.simulatesSearchDelay ? timer(100) : of()),
      alwaysTap(() => this._searching = false),
    );
  }

  resetProperties() {
    this._initProperties();
    this._update();
  }

  search(term: string) {
    this._programmatic$.next(term);
    this._input.nativeElement.focus();
  }
  onFocus(event: Event) { this._searchOnEvent(event, this._inputFocus$); }
  onClick(event: Event) { this._searchOnEvent(event, this._inputClick$); }
  private _searchOnEvent(event: Event, observable$: Subject<string>) {
    observable$.next((event.target as HTMLInputElement).value);
  }

  onBlur() {
    this._justBlurred = true;
    setTimeout(() => this._justBlurred = false, 100);
  }

  private _update() { this._changeDetector.detectChanges(); }

  private _getResults(term: string): string[] {
    return term === ''
      ? COLORS
      : COLORS.filter(color => color.startsWith(term));
  }

  private _isOpen(): boolean { return this._instance.isPopupOpen(); }
  private _isClosed(): boolean { return !this._isOpen(); }

  private _isSearching(): boolean { return this._searching; }
  private _isNotSearching(): boolean { return !this._isSearching(); }

  // FIXME 2018-11-14T11:29:29+01:00
  // this is not enough to watch the blur
  // when opened programmatically, it won't be tracked
  // the best would be to be notified when the popup closes, no matter why
  // the only way would be to monkey patch the private method `_closePopup`
  private _hasJustClosed(): boolean { return this._justBlurred; }

  private _shouldOpenOnClickOrFocus(): boolean {
    return this._isNotSearching()
    && this._isClosed()
    && !this._hasJustClosed()
    ;
  }
}
