import {Component, Input, Output, EventEmitter, TemplateRef, OnInit, ViewContainerRef} from '@angular/core';

import {toString} from '../util/util';

/**
 * Context for the typeahead result template in case you want to override the default one
 */
export interface ResultTemplateContext {
  /**
   * Your typeahead result data model
   */
  result: any;

  /**
   * Search term from the input used to get current result
   */
  term: string;
}

@Component({
  selector: 'ngb-typeahead-window',
  exportAs: 'ngbTypeaheadWindow',
  host: {
    'class': 'dropdown-menu',
    'style': 'display: block',
    '[style.max-height]': 'maxHeight == null ? null : maxHeight',
    '[style.overflow]': 'maxHeight == null ? null : "auto"',
    'role': 'listbox',
    '[id]': 'id'
  },
  template: `
    <ng-template #rt let-result="result" let-term="term" let-formatter="formatter">
      <ngb-highlight [result]="formatter(result)" [term]="term"></ngb-highlight>
    </ng-template>
    <ng-template ngFor [ngForOf]="results" let-result let-idx="index">
      <button type="button" class="dropdown-item" role="option"
        [id]="id + '-' + idx"
        [class.active]="idx === activeIdx"
        (mouseenter)="markActive(idx)"
        (click)="select(result)">
          <ng-template [ngTemplateOutlet]="resultTemplate || rt"
          [ngTemplateOutletContext]="{result: result, term: term, formatter: formatter}"></ng-template>
      </button>
    </ng-template>
  `
})
export class NgbTypeaheadWindow implements OnInit {
  activeIdx = 0;

  /**
   *  The id for the typeahead widnow. The id should be unique and the same
   *  as the associated typeahead's id.
   */
  @Input() id: string;

  /**
   * Flag indicating if the first row should be active initially
   */
  @Input() focusFirst = true;

  /**
   * Typeahead match results to be displayed
   */
  @Input() results;

  /**
   * Search term used to get current results
   */
  @Input() term: string;

  /**
   * A function used to format a given result before display. This function should return a formatted string without any
   * HTML markup
   */
  @Input() formatter = toString;

  /**
   * A template to override a matching result default display
   */
  @Input() resultTemplate: TemplateRef<ResultTemplateContext>;

  /**
   * A CSS max-height value to limit the height and be able to scroll through the list of results.
   */
  @Input() maxHeight: string;

  /**
   * Event raised when user selects a particular result row
   */
  @Output('select') selectEvent = new EventEmitter();

  @Output('activeChange') activeChangeEvent = new EventEmitter();

  constructor(private view: ViewContainerRef) {}

  getActive() { return this.results[this.activeIdx]; }

  markActive(activeIdx: number) {
    this.activeIdx = activeIdx;
    this._activeChanged(null);
  }

  next() {
    if (this.activeIdx === this.results.length - 1) {
      this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.results.length : -1;
    } else {
      this.activeIdx++;
    }
    this._activeChanged(1);
  }

  prev() {
    if (this.activeIdx < 0) {
      this.activeIdx = this.results.length - 1;
    } else if (this.activeIdx === 0) {
      this.activeIdx = this.focusFirst ? this.results.length - 1 : -1;
    } else {
      this.activeIdx--;
    }
    this._activeChanged(-1);
  }

  select(item) { this.selectEvent.emit(item); }

  ngOnInit() {
    this.activeIdx = this.focusFirst ? 0 : -1;
    this._activeChanged(null);
  }

  private _activeChanged(direction) {
    const {activeIdx, id} = this;

    const activeId = activeIdx < 0 ? undefined : `${id}-${activeIdx}`;

    if (activeId != null) {
      const container = this.view.element.nativeElement;
      const elementsList = container.querySelectorAll('.dropdown-item');
      const activeElement = elementsList[activeIdx];

      // if the element is null
      // it means the content has not been inserted yet (the window is opening)
      // so we have nothing to do:
      // the first element will be aligned properly at the top
      if (activeElement != null) {
        this._ensureActiveElementIsVisible({activeElement, container, direction});
      }
    }

    this.activeChangeEvent.emit(activeId);
  }

  private _ensureActiveElementIsVisible({activeElement, container, direction}) {
    if (direction == null) {
      // the keyboard wasn't used, we don't want to do anything in this case
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerStyle = window.getComputedStyle(container);
    const getStyleValue = (style, property) => parseInt(style.getPropertyValue(property), 10);
    const getVerticalOffset = (style, zone) =>
        getStyleValue(style, `padding-${zone}`) + getStyleValue(style, `border-${zone}-width`);

    const adjustScroll = (zone, offsetDirection) => {
      const innerContentOffset = getVerticalOffset(containerStyle, zone) * offsetDirection;
      const difference = activeElement.getBoundingClientRect()[zone] - (containerRect[zone] + innerContentOffset);
      if (difference * offsetDirection < 0) {
        container.scrollTop += difference;
      }
    };

    adjustScroll('bottom', -1);
    adjustScroll('top', +1);
  }
}
