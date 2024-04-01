import { define } from '@nvidia-elements/core/internal';
import { Checkbox, CheckboxGroup } from '@nvidia-elements/core/checkbox';
import '@nvidia-elements/core/forms/define.js';

define(Checkbox);
define(CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-checkbox': Checkbox;
    'mlv-checkbox-group': CheckboxGroup;
  }
}
