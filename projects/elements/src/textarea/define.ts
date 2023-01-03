import { defineElement } from '@elements/elements/internal';
import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/forms/define.js';

defineElement('nve-textarea', Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'nve-textarea': Textarea;
  }
}
