import { Select } from '@elements/elements/select';
import '@elements/elements/forms/define.js';

customElements.get('mlv-select') || customElements.define('mlv-select', Select);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-select': Select;
  }
}
