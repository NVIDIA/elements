import { define } from '@nvidia-elements/core/internal';
import { Canvas } from './canvas.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';
import '@nvidia-elements/code/codeblock/define.js';

define(Canvas);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-canvas': Canvas;
  }
}
