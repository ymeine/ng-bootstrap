import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  Directive,
  TemplateRef,
  ContentChild,
  AfterContentChecked,
  AfterViewInit,
  Output,
  EventEmitter,
  Renderer2,
  ElementRef
} from '@angular/core';
import {NgbTabsetConfig} from './tabset-config';
import { Transition, TransitionOptions } from '../util/transition/ngbTransition';

let nextId = 0;

/**
 * This directive should be used to wrap tab titles that need to contain HTML markup or other directives.
 */
@Directive({selector: 'ng-template[ngbTabTitle]'})
export class NgbTabTitle {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * This directive must be used to wrap content to be displayed in a tab.
 */
@Directive({selector: 'ng-template[ngbTabContent]'})
export class NgbTabContent {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * A directive representing an individual tab.
 */
@Directive({selector: 'ngb-tab'})
export class NgbTab {
  /**
   * Unique tab identifier. Must be unique for the entire document for proper accessibility support.
   */
  @Input() id = `ngb-tab-${nextId++}`;
  /**
   * Simple (string only) title. Use the "NgbTabTitle" directive for more complex use-cases.
   */
  @Input() title: string;
  /**
   * Allows toggling disabled state of a given state. Disabled tabs can't be selected.
   */
  @Input() disabled = false;

  /**
   * A flag telling if the panel is currently animated
   */
  transitionRunning = false;

  titleTpl: NgbTabTitle | null;
  contentTpl: NgbTabContent | null;

  @ContentChildren(NgbTabTitle, {descendants: false}) titleTpls: QueryList<NgbTabTitle>;
  @ContentChildren(NgbTabContent, {descendants: false}) contentTpls: QueryList<NgbTabContent>;

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
 * The payload of the change event fired right before the tab change
 */
export interface NgbTabChangeEvent {
  /**
   * Id of the currently active tab
   */
  activeId: string;

  /**
   * Id of the newly selected tab
   */
  nextId: string;

  /**
   * Function that will prevent tab switch if called
   */
  preventDefault: () => void;
}

/**
 * A component that makes it easy to create tabbed interface.
 */
@Component({
  selector: 'ngb-tabset',
  exportAs: 'ngbTabset',
  template: `
    <ul [class]="'nav nav-' + type + (orientation == 'horizontal'?  ' ' + justifyClass : ' flex-column')" role="tablist">
      <li class="nav-item" *ngFor="let tab of tabs">
        <a [id]="tab.id" class="nav-link" [class.active]="tab.id === activeId" [class.disabled]="tab.disabled"
          href (click)="select(tab.id); $event.preventDefault()" role="tab" [attr.tabindex]="(tab.disabled ? '-1': undefined)"
          [attr.aria-controls]="(!destroyOnHide || tab.id === activeId ? 'ngb-panel-' + tab.id : null)"
          [attr.aria-expanded]="tab.id === activeId" [attr.aria-disabled]="tab.disabled">
          {{tab.title}}<ng-template [ngTemplateOutlet]="tab.titleTpl?.templateRef"></ng-template>
        </a>
      </li>
    </ul>
    <div class="tab-content">
      <ng-template ngFor let-tab [ngForOf]="tabs">
        <div
          class="tab-pane fade"
          *ngIf="!destroyOnHide || tab.id === activeId || tab.transitionRunning"
          role="tabpanel"
          [attr.aria-labelledby]="tab.id" id="ngb-panel-{{tab.id}}"
          [attr.aria-expanded]="tab.id === activeId">
          <ng-template [ngTemplateOutlet]="tab.contentTpl?.templateRef"></ng-template>
        </div>
      </ng-template>
    </div>
  `
})
export class NgbTabset implements AfterContentChecked, AfterViewInit {
  private _fadingTransition: Transition;

  /**
   * A flag to enable/disable the animation when changing the active tab.
   */
  @Input() enableAnimation: boolean;

  justifyClass: string;

  @ContentChildren(NgbTab) tabs: QueryList<NgbTab>;


  /**
   * An identifier of an initially selected (active) tab. Use the "select" method to switch a tab programmatically.
   */
  @Input() activeId: string;

  /**
   * Whether the closed tabs should be hidden without destroying them
   */
  @Input() destroyOnHide = true;

  /**
   * The horizontal alignment of the nav with flexbox utilities. Can be one of 'start', 'center', 'end', 'fill' or
   * 'justified'
   * The default value is 'start'.
   */
  @Input()
  set justify(className: 'start' | 'center' | 'end' | 'fill' | 'justified') {
    if (className === 'fill' || className === 'justified') {
      this.justifyClass = `nav-${className}`;
    } else {
      this.justifyClass = `justify-content-${className}`;
    }
  }

  /**
   * The orientation of the nav (horizontal or vertical).
   * The default value is 'horizontal'.
   */
  @Input() orientation: 'horizontal' | 'vertical';

  /**
   * Type of navigation to be used for tabs. Can be one of Bootstrap defined types ('tabs' or 'pills').
   * Since 3.0.0 can also be an arbitrary string (for custom themes).
   */
  @Input() type: 'tabs' | 'pills' | string;

  /**
   * A tab change event fired right before the tab selection happens. See NgbTabChangeEvent for payload details
   */
  @Output() tabChange = new EventEmitter<NgbTabChangeEvent>();

  constructor(config: NgbTabsetConfig, private _renderer: Renderer2, private _element: ElementRef) {
    this.type = config.type;
    this.justify = config.justify;
    this.orientation = config.orientation;
    this.enableAnimation = config.enableAnimation;

    const toggleActiveClass = (tabContentElement: HTMLElement, options: TransitionOptions) => {
      const classList = tabContentElement.classList;
      classList.toggle('active', options.data.direction === 'show');
    };

    this._fadingTransition = new Transition({
      classname: 'show',
      beforeTransitionStart: toggleActiveClass,
      afterTransitionEnd: toggleActiveClass
    }, this._renderer);
  }

  /**
   * Selects the tab with the given id and shows its associated pane.
   * Any other tab that was previously selected becomes unselected and its associated pane is hidden.
   */
  select(tabId: string) {
    let selectedTab = this._getTabById(tabId);
    if (selectedTab && !selectedTab.disabled && this.activeId !== selectedTab.id) {
      let defaultPrevented = false;

      this.tabChange.emit(
          {activeId: this.activeId, nextId: selectedTab.id, preventDefault: () => { defaultPrevented = true; }});

      if (!defaultPrevented) {
        const fadingTransition = this._fadingTransition;

        const previousTab = this._getTabById(this.activeId);
        previousTab.transitionRunning = true;

        setTimeout(() => {
          fadingTransition.hide(this._getPanelElement(previousTab.id), {
            enableAnimation: false,
            data : {
              direction: 'hide'
            }
          }).then(() => {
            previousTab.transitionRunning = false;
          });
        }, 0);

        this.activeId = selectedTab.id;

        selectedTab.transitionRunning = true;
        setTimeout(() => {
          fadingTransition.show(this._getPanelElement(selectedTab.id), {
            enableAnimation: this.enableAnimation,
            data : {
              direction: 'show'
            }
          }).then(() => {
            selectedTab.transitionRunning = false;
          });
        }, 0);
      }
    }
  }

  ngAfterContentChecked() {
    // auto-correct activeId that might have been set incorrectly as input
    let activeTab = this._getTabById(this.activeId);
    this.activeId = activeTab ? activeTab.id : (this.tabs.length ? this.tabs.first.id : null);
  }

  ngAfterViewInit(): void {
    if (this.activeId != null) {
      this._fadingTransition.show(this._getPanelElement(this.activeId), {
        enableAnimation: false,
        data : {
          direction: 'show'
        }
      });
    }
  }

  private _getTabById(id: string): NgbTab {
    let tabsWithId: NgbTab[] = this.tabs.filter(tab => tab.id === id);
    return tabsWithId.length ? tabsWithId[0] : null;
  }

  private _getPanelElement(tabId: string): HTMLElement {
    return this._element.nativeElement.querySelector('#ngb-panel-' + tabId);
  }


}
