import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('mlv-datetime') || customElements.define('mlv-datetime', Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-datetime': Datetime;
  }
}
