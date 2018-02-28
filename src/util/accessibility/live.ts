import {
  Injectable,
  Inject,
  OnDestroy
} from '@angular/core';
import {DOCUMENT} from '@angular/common';



@Injectable()
export class Live implements OnDestroy {
  private _element: HTMLElement;

  constructor(
    @Inject(DOCUMENT) private _document: any
  ) {
    this._element = this._createElement();
  }

  ngOnDestroy() {
    this._element.remove();
  }

  async say(message: string): Promise<void> {
    const element = this._element;

    element.textContent = '';
    await new Promise(resolve => setTimeout(resolve, 100));
    element.textContent = message;
  }

  private _createElement(): HTMLElement {
    const document = this._document;

    const element = document.createElement('div');

    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');

    element.classList.add('sr-only');

    document.body.appendChild(element);

    return element;
  }
}
