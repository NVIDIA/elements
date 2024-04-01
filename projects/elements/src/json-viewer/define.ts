import { define } from '@nvidia-elements/core/internal';
import { JSONNode } from './node/node.js';
import { JSONViewer } from './index.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/button/define.js';

define(JSONViewer);
define(JSONNode);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-json-viewer': JSONViewer;
    'mlv-json-node': JSONNode;
  }
}
