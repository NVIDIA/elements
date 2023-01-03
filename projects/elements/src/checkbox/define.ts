import { defineElement } from '@elements/elements/internal';
import { Checkbox, CheckboxGroup } from '@elements/elements/checkbox';
import '@elements/elements/forms/define.js';

defineElement('nve-checkbox', Checkbox);
defineElement('nve-checkbox-group', CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-checkbox': Checkbox;
    'nve-checkbox-group': CheckboxGroup;
  }
}
