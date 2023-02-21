import { define } from '@elements/elements/internal';
import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/forms/define.js';

define(Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'nve-textarea': Textarea;
  }
}
