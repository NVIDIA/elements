import { define } from '@elements/elements/internal';
import { Checkbox, CheckboxGroup } from '@elements/elements/checkbox';
import '@elements/elements/forms/define.js';

define(Checkbox);
define(CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-checkbox': Checkbox;
    'mlv-checkbox-group': CheckboxGroup;
  }
}
