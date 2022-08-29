import { Switch, SwitchGroup } from '@elements/elements/switch';
import '@elements/elements/forms/define.js';

customElements.get('mlv-switch') || customElements.define('mlv-switch', Switch);
customElements.get('mlv-switch-group') || customElements.define('mlv-switch-group', SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-switch': Switch;
    'mlv-switch-group': SwitchGroup;
  }
}
