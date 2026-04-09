import { define } from '@nvidia-elements/core/internal';
import { Checkbox, CheckboxGroup } from '@nvidia-elements/core/checkbox';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Checkbox);
define(CheckboxGroup);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-checkbox': Checkbox;
    'nve-checkbox-group': CheckboxGroup;
  }
}
