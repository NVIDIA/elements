import { Select } from '@elements/elements/select';
import '@elements/elements/forms/define.js';

customElements.get('nve-select') || customElements.define('nve-select', Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
  }
}
