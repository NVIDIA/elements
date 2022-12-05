import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-datetime') || customElements.define('nve-datetime', Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-datetime': Datetime;
  }
}
