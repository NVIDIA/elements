import { Month } from '@elements/elements/month';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-month') || customElements.define('nve-month', Month);

declare global {
  interface HTMLElementTagNameMap {
    'nve-month': Month;
  }
}
