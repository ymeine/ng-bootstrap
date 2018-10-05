import {
  Injector,
  TemplateRef,
  ViewRef,
  ViewContainerRef,
  Renderer2,
  ComponentRef,
  ComponentFactoryResolver
} from '@angular/core';
import {Transition} from './transition/ngbTransition';
import {ElementRef} from '@angular/core';
import {resolve} from 'url';
import {Recoverable} from 'repl';

export class ContentRef {
  constructor(public nodes: any[], public viewRef?: ViewRef, public componentRef?: ComponentRef<any>) {}
}

export class PopupService<T> {
  private _windowRef: ComponentRef<T>;
  private _contentRef: ContentRef;

  private _enableAnimation = true;
  private _fadingTransition: Transition;

  constructor(
      private _type: any, private _injector: Injector, private _viewContainerRef: ViewContainerRef,
      private _renderer: Renderer2, private _elementRef: ElementRef,
      private _componentFactoryResolver: ComponentFactoryResolver) {

        this._fadingTransition = new Transition({classname: 'show'}, this._renderer);

  }

  open(content?: string | TemplateRef<any>, context?: any, enableAnimation = true): ComponentRef<T> {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      this._windowRef = this._viewContainerRef.createComponent(
          this._componentFactoryResolver.resolveComponentFactory<T>(this._type), 0, this._injector,
          this._contentRef.nodes);
    }

    const element = this._windowRef.location.nativeElement;

    setTimeout(() => {
      this._fadingTransition.show(element, {enableAnimation: enableAnimation});
    }, 0);

    return this._windowRef;
  }

  close(enableAnimation = true): Promise<void> {
    return new Promise((pResolve, reject) => {
      if (this._windowRef) {

        setTimeout(() => {
          const element = this._windowRef.location.nativeElement;
          this._fadingTransition.hide(element, {enableAnimation: enableAnimation}).then(() => {
            this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._windowRef.hostView));
            this._windowRef = null;

            if (this._contentRef.viewRef) {
              this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.viewRef));
              this._contentRef = null;
            }
            pResolve();
          });
        }, 0);

      } else {
        pResolve();
      }
    });
  }

  private _getContentRef(content: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<T>>content, context);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this._renderer.createText(`${content}`)]]);
    }
  }
}
