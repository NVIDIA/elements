import { define } from '@nvidia-elements/core/internal';
import { Switch, SwitchGroup } from '@nvidia-elements/core/switch';
import '@nvidia-elements/core/forms/define.js';

define(Switch);
define(SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-switch': Switch;
    'mlv-switch-group': SwitchGroup;
  }
}
