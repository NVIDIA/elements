import { Control, ControlGroup, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/alert/define.js';
import '@elements/elements/icon/define.js';

customElements.get('mlv-control') || customElements.define('mlv-control', Control);
customElements.get('mlv-control-group') || customElements.define('mlv-control-group', ControlGroup);
customElements.get('mlv-control-message') || customElements.define('mlv-control-message', ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-control': Control;
    'mlv-control-group': ControlGroup;
    'mlv-control-message': ControlMessage;
  }
}
