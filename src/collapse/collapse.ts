import {Directive, Input, OnChanges, Renderer2, ElementRef} from '@angular/core';
import {Transition} from '../util/transition/ngbTransition';
import {collapsingTransition, showTransition} from '../util/transition/ngbCollapseTransition';

/**
 * The NgbCollapse directive provides a simple way to hide and show an element with animations.
 */
@Directive({
  selector: '[ngbCollapse]',
  exportAs: 'ngbCollapse',
  host: {'[class.collapse]': 'true'}
})
export class NgbCollapse implements OnChanges {
  /**
   * A flag indicating collapsed (true) or open (false) state.
   */
  @Input('ngbCollapse') collapsed = false;

  /**
   * A flag to enable/disable the animation
   */
  @Input() enableAnimation = true;

  private _collapsingTransition: Transition;


  constructor(_renderer: Renderer2, private _element: ElementRef) {
    this._collapsingTransition = new Transition(collapsingTransition, _renderer);
  }

  ngOnChanges(changes) {
    const collapsed = changes.collapsed;
    if (collapsed) {
      const element = this._element.nativeElement;
      const collapsing = this._collapsingTransition;
      if (collapsed.firstChange) {
        if (!collapsed.currentValue) {
          collapsing.show(element, {enableAnimation: false});
        }
      } else {
        collapsing.show(element, {enableAnimation: this.enableAnimation});
      }
    }
  }
}
