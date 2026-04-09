import { define } from '@nvidia-elements/core/internal';
import { Radio, RadioGroup } from '@nvidia-elements/core/radio';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Radio);
define(RadioGroup);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-radio': Radio;
    'nve-radio-group': RadioGroup;
  }
}
