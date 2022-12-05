import { Switch, SwitchGroup } from '@elements/elements/switch';
import '@elements/elements/forms/define.js';

customElements.get('nve-switch') || customElements.define('nve-switch', Switch);
customElements.get('nve-switch-group') || customElements.define('nve-switch-group', SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-switch': Switch;
    'nve-switch-group': SwitchGroup;
  }
}
