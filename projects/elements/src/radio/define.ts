import { defineElement } from '@elements/elements/internal';
import { Radio, RadioGroup } from '@elements/elements/radio';
import '@elements/elements/forms/define.js';

defineElement('nve-radio', Radio);
defineElement('nve-radio-group', RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-radio': Radio;
    'nve-radio-group': RadioGroup;
  }
}
