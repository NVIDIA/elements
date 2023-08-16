import { define } from '@elements/elements/internal';
import { JSONNode } from './node/node.js';
import { JSONViewer } from './index.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/button/define.js';

define(JSONViewer);
define(JSONNode);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-json-viewer': JSONViewer;
    'mlv-json-node': JSONNode;
  }
}
