import { define } from '@elements/elements/internal';
import { Radio, RadioGroup } from '@elements/elements/radio';
import '@elements/elements/forms/define.js';

define(Radio);
define(RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-radio': Radio;
    'mlv-radio-group': RadioGroup;
  }
}
