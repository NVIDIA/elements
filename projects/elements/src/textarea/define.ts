import { defineElement } from '@elements/elements/internal';
import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/forms/define.js';

defineElement('mlv-textarea', Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-textarea': Textarea;
  }
}
