import { defineElement } from '@elements/elements/internal';
import { Input, InputGroup } from '@elements/elements/input';
import '@elements/elements/forms/define.js';

defineElement('nve-input', Input);
defineElement('nve-input-group', InputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-input': Input;
    'nve-input-group': InputGroup;
  }
}
