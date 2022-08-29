import { Month } from '@elements/elements/month';
import '@elements/elements/forms/define.js';

customElements.get('mlv-month') || customElements.define('mlv-month', Month);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-month': Month;
  }
}
