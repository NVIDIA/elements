import { defineElement } from '@elements/elements/internal';
import { Switch, SwitchGroup } from '@elements/elements/switch';
import '@elements/elements/forms/define.js';

defineElement('nve-switch', Switch);
defineElement('nve-switch-group', SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-switch': Switch;
    'nve-switch-group': SwitchGroup;
  }
}
