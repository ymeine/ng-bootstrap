import { element } from 'protractor';
import {
  AfterContentChecked,
  OnChanges,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  Renderer2,
  ElementRef
} from '@angular/core';

import { isString } from '../util/util';

import { NgbAccordionConfig } from './accordion-config';
import { Transition } from '../util/transition/ngbTransition';
import { collapsingTransition } from '../util/transition/ngbCollapseTransition';

let nextId = 0;

/**
 * This directive should be used to wrap accordion panel titles that need to contain HTML markup or other directives.
 */
@Directive({selector: 'ng-template[ngbPanelTitle]'})
export class NgbPanelTitle {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * This directive must be used to wrap accordion panel content.
 */
@Directive({selector: 'ng-template[ngbPanelContent]'})
export class NgbPanelContent {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * The NgbPanel directive represents an individual panel with the title and collapsible
 * content
 */
@Directive({selector: 'ngb-panel'})
export class NgbPanel implements AfterContentChecked {
  /**
   *  A flag determining whether the panel is disabled or not.
   *  When disabled, the panel cannot be toggled.
   */
  @Input() disabled = false;

  /**
   *  An optional id for the panel. The id should be unique.
   *  If not provided, it will be auto-generated.
   */
  @Input() id = `ngb-panel-${nextId++}`;

  /**
   * A flag telling if the panel is currently open
   */
  isOpen = false;

  /**
   * A flag telling if the panel is currently animated
   */
  transitionRunning = false;

  /**
   *  The title for the panel.
   */
  @Input() title: string;

  /**
   *  Accordion's types of panels to be applied per panel basis.
   *  Bootstrap recognizes the following types: "primary", "secondary", "success", "danger", "warning", "info", "light"
   * and "dark"
   */
  @Input() type: string;

  titleTpl: NgbPanelTitle | null;
  contentTpl: NgbPanelContent | null;

  @ContentChildren(NgbPanelTitle, {descendants: false}) titleTpls: QueryList<NgbPanelTitle>;
  @ContentChildren(NgbPanelContent, {descendants: false}) contentTpls: QueryList<NgbPanelContent>;

  ngAfterContentChecked() {
    // We are using @ContentChildren instead of @ContentChild as in the Angular version being used
    // only @ContentChildren allows us to specify the {descendants: false} option.
    // Without {descendants: false} we are hitting bugs described in:
    // https://github.com/ng-bootstrap/ng-bootstrap/issues/2240
    this.titleTpl = this.titleTpls.first;
    this.contentTpl = this.contentTpls.first;
  }
}

/**
 * The payload of the change event fired right before toggling an accordion panel
 */
export interface NgbPanelChangeEvent {
  /**
   * Id of the accordion panel that is toggled
   */
  panelId: string;

  /**
   * Whether the panel will be opened (true) or closed (false)
   */
  nextState: boolean;

  /**
   * Function that will prevent panel toggling if called
   */
  preventDefault: () => void;
}

/**
 * The NgbAccordion directive is a collection of panels.
 * It can assure that only one panel can be opened at a time.
 */
@Component({
  selector: 'ngb-accordion',
  exportAs: 'ngbAccordion',
  host: {
    'class': 'accordion',
    'role': 'tablist',
    '[attr.aria-multiselectable]': '!closeOtherPanels'
  },
  template: `
    <ng-template ngFor let-panel [ngForOf]="panels">
      <div class="card">
        <div
          role="tab"
          id="{{panel.id}}-header"
          [class]="'card-header ' + (panel.type ? 'bg-' + panel.type : type ? 'bg-' + type : '')"
        >
          <button
            type="button"
            class="btn btn-link"
            [class.collapsed]="!panel.isOpen"
            [disabled]="panel.disabled"
            [attr.aria-expanded]="panel.isOpen"
            [attr.aria-controls]="panel.id"
            (click)="toggle(panel.id)"
          >
            {{panel.title}}<ng-template [ngTemplateOutlet]="panel.titleTpl?.templateRef"></ng-template>
          </button>
        </div>
        <div
          *ngIf="!destroyOnHide || panel.isOpen || panel.transitionRunning"
          class="collapse"
          id="{{panel.id}}"
          role="tabpanel"
          [attr.aria-labelledby]="panel.id + '-header'"
        >
          <div class="card-body">
              <ng-template [ngTemplateOutlet]="panel.contentTpl?.templateRef"></ng-template>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class NgbAccordion implements AfterContentChecked, OnChanges {
  private _collapsingTransition: Transition;
  private _updatePanels = true;
  private _panelInitDone = false;

  @ContentChildren(NgbPanel) panels: QueryList<NgbPanel>;

  /**
   * An array or comma separated strings of panel identifiers that should be opened
   */
  @Input() activeIds: string | string[] = [];

  /**
   *  Whether the other panels should be closed when a panel is opened
   */
  @Input('closeOthers') closeOtherPanels: boolean;

  /**
   * Whether the closed panels should be hidden without destroying them
   */
  @Input() destroyOnHide = true;

  /**
   *  Accordion's types of panels to be applied globally.
   *  Bootstrap recognizes the following types: "primary", "secondary", "success", "danger", "warning", "info", "light"
   * and "dark
   */
  @Input() type: string;

  /**
   * A flag to enable/disable the animation when closing.
   */
  @Input() enableAnimation: boolean;

  /**
   * A panel change event fired right before the panel toggle happens. See NgbPanelChangeEvent for payload details
   */
  @Output() panelChange = new EventEmitter<NgbPanelChangeEvent>();

  constructor(config: NgbAccordionConfig, _renderer: Renderer2, private _element: ElementRef) {
    this.type = config.type;
    this.closeOtherPanels = config.closeOthers;
    this.enableAnimation = config.enableAnimation;

    this._collapsingTransition = new Transition(collapsingTransition, _renderer);

  }

  /**
   * Checks if a panel with a given id is expanded or not.
   */
  isExpanded(panelId: string): boolean { return this.activeIds.indexOf(panelId) > -1; }

  /**
   * Expands a panel with a given id. Has no effect if the panel is already expanded or disabled.
   */
  expand(panelId: string): void {
    this._addActiveId(panelId);
    this._updateAllOpenState();
  }

  /**
   * Expands all panels if [closeOthers]="false". For the [closeOthers]="true" case will have no effect if there is an
   * open panel, otherwise the first panel will be expanded.
   */
  expandAll(): void {
    if (this.closeOtherPanels) {
      if (this.activeIds.length === 0 && this.panels.length) {
        this.activeIds = [this.panels.first.id];
      }
    } else {
      this.activeIds = this.panels.map(panel => panel.id);
      // this.panels.forEach(panel => this._changeOpenState(panel, true));
    }
    this._updateAllOpenState();
  }

  /**
   * Collapses a panel with a given id. Has no effect if the panel is already collapsed or disabled.
   */
  collapse(panelId: string) {
    this._removeActiveId(panelId);
    this._updateAllOpenState();
  }

  /**
   * Collapses all open panels.
   */
  collapseAll() {
    this.activeIds = [];
    this._updateAllOpenState();
  }

  /**
   * Programmatically toggle a panel with a given id. Has no effect if the panel is disabled.
   */
  toggle(panelId: string) {
    console.log('toggling');
    console.log(this.activeIds);
    console.log(panelId);
    if (this.activeIds.indexOf(panelId) > -1) {
      this._removeActiveId(panelId);
    } else {
      this._addActiveId(panelId);
    }
    console.log(this.activeIds);
    console.log('-'.repeat(80));
    this._updateAllOpenState();
  }

   /**
   * Programmatically toggle the state of the panel with a given id. Has no effect if the panel is disabled.
   */
  togglePanelState(panelId: string, enable?: boolean) {
    const panel = this._findPanelById(panelId);
    if (panel) {
      if (enable == null) {
        // Toggle the state
        enable = panel.disabled;
      }
      panel.disabled = !enable;
      this._updateActiveIds();
      this._updatePanels = true;
    }
  }


  ngOnChanges(param): void {
    if (param.activeIds) {
      this._updatePanels = true;
    }
  }

  ngAfterContentChecked() {
    if (this._updatePanels) {
      // active id updates
      if (isString(this.activeIds)) {
        this.activeIds = this.activeIds.split(/\s*,\s* /);
      }

      this._updateAllOpenState();

      this._updatePanels = false;
      }
  }

  private _addActiveId(id) {
    if (this.closeOtherPanels) {
      this.activeIds = [];
    }

    if (isString(this.activeIds)) {
      this.activeIds = this.activeIds.split(/\s*,\s* /);
    }

    const activeIds = this.activeIds;
    if (activeIds.indexOf(id) === -1) {
      activeIds.push(id);
    }
  }

  private _removeActiveId(id) {
    if (isString(this.activeIds)) {
      this.activeIds = this.activeIds.split(/\s*,\s* /);
    }
    this.activeIds = this.activeIds.filter(currentId => currentId !== id);
  }

  private _updateAllOpenState() {
      // closeOthers updates
      if (this.activeIds.length > 1 && this.closeOtherPanels) {
        // Only the first one is selected
        this.activeIds = [this.activeIds[0]];
      }

    this.panels.forEach(panel => {
      const nextState = !panel.disabled && this.activeIds.indexOf(panel.id) > -1;
      this._changeOpenState(panel, nextState);
    });

      this._panelInitDone = true;
  }

  private _changeOpenState(panel: NgbPanel, nextState: boolean) {
    if (panel && !panel.disabled && panel.isOpen !== nextState) {
      let defaultPrevented = false;
      const panelId = panel.id;

      this.panelChange.emit(
          {panelId: panelId, nextState: nextState, preventDefault: () => { defaultPrevented = true; }});

      if (!defaultPrevented) {
        panel.transitionRunning = true;
        setTimeout(async () => {
            await this._collapsingTransition.show(this._getPanelElement(panel.id), {
              enableAnimation: this.enableAnimation,
            });
            // panel.transitionRunning = false;
          }, 1);
        }
      }
  }

  private _getPanelElement(panelId: string): HTMLElement | null {
    return this._element.nativeElement.querySelector('#' + panelId);
  }

  private _findPanelById(panelId: string): NgbPanel | null { return this.panels.find(p => p.id === panelId); }

  private _updateActiveIds() {
    this.activeIds = this.panels.filter(panel => panel.isOpen && !panel.disabled).map(panel => panel.id);
  }
}
