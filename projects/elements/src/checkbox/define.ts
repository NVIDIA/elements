import { defineElement } from '@elements/elements/internal';
import { Checkbox, CheckboxGroup } from '@elements/elements/checkbox';
import '@elements/elements/forms/define.js';

defineElement('mlv-checkbox', Checkbox);
defineElement('mlv-checkbox-group', CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-checkbox': Checkbox;
    'mlv-checkbox-group': CheckboxGroup;
  }
}
