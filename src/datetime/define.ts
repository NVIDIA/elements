import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/forms/define.js';

customElements.get('mlv-datetime') || customElements.define('mlv-datetime', Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-datetime': Datetime;
  }
}
