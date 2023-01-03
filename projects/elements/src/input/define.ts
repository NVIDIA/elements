import { defineElement } from '@elements/elements/internal';
import { Input, InputGroup } from '@elements/elements/input';
import '@elements/elements/forms/define.js';

defineElement('mlv-input', Input);
defineElement('mlv-input-group', InputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-input': Input;
    'mlv-input-group': InputGroup;
  }
}
