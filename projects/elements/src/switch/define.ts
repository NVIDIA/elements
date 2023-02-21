import { define } from '@elements/elements/internal';
import { Switch, SwitchGroup } from '@elements/elements/switch';
import '@elements/elements/forms/define.js';

define(Switch);
define(SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-switch': Switch;
    'mlv-switch-group': SwitchGroup;
  }
}
