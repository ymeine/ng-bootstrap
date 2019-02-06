import {Injectable} from '@angular/core';

import * as prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/line-highlight/prism-line-highlight';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

// Prism tries to highlight the whole document on DOMContentLoad.
// Unfortunately with webpack the only way of disabling it
// is by simply forcing it to highlight no elements -> []
prism.hooks.add('before-highlightall', (env) => {
  env['elements'] = [];
});

@Injectable()
export class CodeHighlightService {
  highlightElement(element: HTMLElement) {
    prism.highlightElement(element);
  }
}
