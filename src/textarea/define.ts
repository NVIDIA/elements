import { Textarea } from '@elements/elements/textarea';
import '@elements/elements/forms/define.js';

customElements.get('mlv-textarea') || customElements.define('mlv-textarea', Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-textarea': Textarea;
  }
}
