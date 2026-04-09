import { define } from '@nvidia-elements/core/internal';
import { Switch, SwitchGroup } from '@nvidia-elements/core/switch';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Switch);
define(SwitchGroup);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-switch': Switch;
    'nve-switch-group': SwitchGroup;
  }
}
