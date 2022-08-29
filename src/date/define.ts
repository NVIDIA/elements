import { Date } from '@elements/elements/date';
import '@elements/elements/forms/define.js';

customElements.get('mlv-date') || customElements.define('mlv-date', Date);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-date': Date;
  }
}
