import { NgbTransitionService } from './ngbTransitionService';

import {
  Injectable,
  NgZone,
  Renderer2,
  RendererFactory2,
  RendererStyleFlags2,
  RendererType2,
} from '@angular/core';



@Injectable()
export class NgbTransitionRendererFactory implements RendererFactory2 {
  private _rendererCache = new Map<Renderer2, NgbTransitionRenderer>();

  constructor(
    private delegate: RendererFactory2,
    private zone: NgZone,
    private _ngbTransitionService: NgbTransitionService,
  ) {}

  createRenderer(hostElement: any, type: RendererType2): Renderer2 {
    const delegate = this.delegate.createRenderer(hostElement, type);
    let renderer: NgbTransitionRenderer | undefined = this._rendererCache.get(delegate);
    if (!renderer) {
      renderer = new NgbTransitionRenderer(
        'ng-bootstrap',
        delegate,
        this.zone,
        this._ngbTransitionService,
      );
      // only cache this result when the base renderer is used
      this._rendererCache.set(delegate, renderer);
    }
    return renderer;
  }

  begin() { this.delegate.begin(); }
  end() { this.delegate.end(); }
  whenRenderingDone(): Promise<any> { return Promise.resolve(); }
}

export class NgbTransitionRenderer implements Renderer2 {
  destroyNode: (node: any) => void;

  constructor(
    protected namespaceId: string,
    public delegate: Renderer2,
    public zone: NgZone,
    private _ngbTransitionService: NgbTransitionService,
  ) {
    this.destroyNode = this.delegate.destroyNode
      ? (n) => delegate.destroyNode!(n)
      : null;
  }

  get data() { return this.delegate.data; }

  destroy(): void { this.delegate.destroy(); }

  // createElement(name: string, namespace?: string | null | undefined) {
  //   return this.delegate.createElement(name, namespace);
  // }
  createElement() {
    return this.delegate.createElement.apply(this.delegate, arguments);
  }

  createComment(value: string) { return this.delegate.createComment(value); }

  createText(value: string) { return this.delegate.createText(value); }

  appendChild(parent: any, newChild: any): void { this.delegate.appendChild(parent, newChild); }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    this.delegate.insertBefore(parent, newChild, refChild);
  }

  removeChild(parent: any, oldChild: any): void {
    this._ngbTransitionService.callHooksForElement(oldChild).then(() => {
      this.delegate.removeChild(parent, oldChild);
    });
  }

  selectRootElement(selectorOrNode: any) { return this.delegate.selectRootElement(selectorOrNode); }

  parentNode(node: any) { return this.delegate.parentNode(node); }

  nextSibling(node: any) { return this.delegate.nextSibling(node); }

  // setAttribute(el: any, name: string, value: string, namespace?: string | null | undefined): void {
  //   this.delegate.setAttribute(el, name, value, namespace);
  // }
  setAttribute() {
    this.delegate.setAttribute.apply(this.delegate, arguments);
  }

  removeAttribute(el: any, name: string, namespace?: string | null | undefined): void {
    this.delegate.removeAttribute(el, name, namespace);
  }

  addClass(el: any, name: string): void { this.delegate.addClass(el, name); }

  removeClass(el: any, name: string): void { this.delegate.removeClass(el, name); }

  setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2 | undefined): void {
    this.delegate.setStyle(el, style, value, flags);
  }

  removeStyle(el: any, style: string, flags?: RendererStyleFlags2 | undefined): void {
    this.delegate.removeStyle(el, style, flags);
  }

  setProperty(el: any, name: string, value: any): void { this.delegate.setProperty(el, name, value); }

  setValue(node: any, value: string): void { this.delegate.setValue(node, value); }

  listen(target: any, eventName: string, callback: (event: any) => boolean | void): () => void {
    return this.delegate.listen(target, eventName, callback);
  }

}
