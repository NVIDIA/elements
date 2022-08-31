import { Control, ControlGroup, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/alert/define.js';
import '@elements/elements/icon/define.js';

customElements.get('nve-control') || customElements.define('nve-control', Control);
customElements.get('nve-control-group') || customElements.define('nve-control-group', ControlGroup);
customElements.get('nve-control-message') || customElements.define('nve-control-message', ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-control': Control;
    'nve-control-group': ControlGroup;
    'nve-control-message': ControlMessage;
  }
}
