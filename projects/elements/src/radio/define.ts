import { define } from '@nvidia-elements/core/internal';
import { Radio, RadioGroup } from '@nvidia-elements/core/radio';
import '@nvidia-elements/core/forms/define.js';

define(Radio);
define(RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-radio': Radio;
    'nve-radio-group': RadioGroup;
    'nve-radio': Radio /** @deprecated */;
    'nve-radio-group': RadioGroup /** @deprecated */;
  }
}
