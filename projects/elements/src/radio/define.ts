import { defineElement } from '@elements/elements/internal';
import { Radio, RadioGroup } from '@elements/elements/radio';
import '@elements/elements/forms/define.js';

defineElement('mlv-radio', Radio);
defineElement('mlv-radio-group', RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-radio': Radio;
    'mlv-radio-group': RadioGroup;
  }
}
