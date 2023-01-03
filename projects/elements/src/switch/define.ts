import { defineElement } from '@elements/elements/internal';
import { Switch, SwitchGroup } from '@elements/elements/switch';
import '@elements/elements/forms/define.js';

defineElement('mlv-switch', Switch);
defineElement('mlv-switch-group', SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-switch': Switch;
    'mlv-switch-group': SwitchGroup;
  }
}
