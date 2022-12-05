import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/forms/define.js';

customElements.get('nve-textarea') || customElements.define('nve-textarea', Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'nve-textarea': Textarea;
  }
}
