import {DOCUMENT} from '@angular/common';
import {
  ApplicationRef,
  Injectable,
  Injector,
  Inject,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  TemplateRef
} from '@angular/core';

import {ContentRef} from '../util/popup';
import {isDefined, isString} from '../util/util';
import {Scrollbar} from '../util/scrollbar';

import {NgbModalBackdrop} from './modal-backdrop';
import {NgbModalWindow} from './modal-window';
import {NgbActiveModal, NgbModalRef} from './modal-ref';

@Injectable()
export class NgbModalStack {
  private _windowAttributes = ['ariaLabelledBy', 'backdrop', 'centered', 'keyboard', 'size', 'windowClass'];
  private _backdropAttributes = ['backdropClass'];

  constructor(
      private _applicationRef: ApplicationRef, private _injector: Injector,
      private _componentFactoryResolver: ComponentFactoryResolver, @Inject(DOCUMENT) private _document,
      private _scrollbar: Scrollbar) {}

  open(moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any, options): NgbModalRef {
    const containerEl =
        isDefined(options.container) ? this._document.querySelector(options.container) : this._document.body;

    const revertPaddingForScrollbar = this._scrollbar.compensateScrollbar();

    if (!containerEl) {
      throw new Error(`The specified modal container "${options.container || 'body'}" was not found in the DOM.`);
    }

    const activeModal = new NgbActiveModal();
    const contentRef = this._getContentRef(moduleCFR, options.injector || contentInjector, content, activeModal);

    let backdropCmptRef: ComponentRef<NgbModalBackdrop> =
        options.backdrop !== false ? this._attachBackdrop(containerEl) : null;
    let windowCmptRef: ComponentRef<NgbModalWindow> = this._attachWindowComponent(containerEl, contentRef);
    let ngbModalRef: NgbModalRef = new NgbModalRef(windowCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);

    ngbModalRef.result.then(revertPaddingForScrollbar, revertPaddingForScrollbar);
    activeModal.close = (result: any) => { ngbModalRef.close(result); };
    activeModal.dismiss = (reason: any) => { ngbModalRef.dismiss(reason); };

    this._applyWindowOptions(windowCmptRef.instance, options);

    if (backdropCmptRef && backdropCmptRef.instance) {
      this._applyBackdropOptions(backdropCmptRef.instance, options);
    }
    return ngbModalRef;
  }

  private _attachBackdrop(containerEl: any): ComponentRef<NgbModalBackdrop> {
    let backdropFactory: ComponentFactory<NgbModalBackdrop> =
        this._componentFactoryResolver.resolveComponentFactory(NgbModalBackdrop);
    let backdropCmptRef = backdropFactory.create(this._injector);
    this._applicationRef.attachView(backdropCmptRef.hostView);
    containerEl.appendChild(backdropCmptRef.location.nativeElement);
    return backdropCmptRef;
  }

  private _attachWindowComponent(containerEl: any, contentRef: any): ComponentRef<NgbModalWindow> {
    let windowFactory = this._componentFactoryResolver.resolveComponentFactory(NgbModalWindow);
    let windowCmptRef = windowFactory.create(this._injector, contentRef.nodes);
    this._applicationRef.attachView(windowCmptRef.hostView);
    containerEl.appendChild(windowCmptRef.location.nativeElement);
    return windowCmptRef;
  }

  private _applyWindowOptions(windowInstance: NgbModalWindow, options: Object): void {
    this._windowAttributes.forEach((optionName: string) => {
      if (isDefined(options[optionName])) {
        windowInstance[optionName] = options[optionName];
      }
    });
  }

  private _applyBackdropOptions(backdropInstance: NgbModalBackdrop, options: Object): void {
    this._backdropAttributes.forEach((optionName: string) => {
      if (isDefined(options[optionName])) {
        backdropInstance[optionName] = options[optionName];
      }
    });
  }

  private _getContentRef(
      moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any,
      context: NgbActiveModal): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      return this._createFromTemplateRef(content, context);
    } else if (isString(content)) {
      return this._createFromString(content);
    } else {
      return this._createFromComponent(moduleCFR, contentInjector, content, context);
    }
  }

  private _createFromTemplateRef(content: TemplateRef<any>, context: NgbActiveModal): ContentRef {
    const viewRef = content.createEmbeddedView(context);
    this._applicationRef.attachView(viewRef);
    return new ContentRef([viewRef.rootNodes], viewRef);
  }

  private _createFromString(content: string): ContentRef {
    const component = this._document.createTextNode(`${content}`);
    return new ContentRef([[component]]);
  }

  private _createFromComponent(
      moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any,
      context: NgbActiveModal): ContentRef {
    const contentCmptFactory = moduleCFR.resolveComponentFactory(content);
    const modalContentInjector = Injector.create([{provide: NgbActiveModal, useValue: context}], contentInjector);
    const componentRef = contentCmptFactory.create(modalContentInjector);
    this._applicationRef.attachView(componentRef.hostView);
    return new ContentRef([[componentRef.location.nativeElement]], componentRef.hostView, componentRef);
  }
}
