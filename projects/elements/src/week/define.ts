import { Week } from '@elements/elements/week';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-week') || customElements.define('nve-week', Week);

declare global {
  interface HTMLElementTagNameMap {
    'nve-week': Week;
  }
}
