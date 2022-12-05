import { Date } from '@elements/elements/date';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-date') || customElements.define('nve-date', Date);

declare global {
  interface HTMLElementTagNameMap {
    'nve-date': Date;
  }
}
