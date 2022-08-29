import { Week } from '@elements/elements/week';
import '@elements/elements/forms/define.js';

customElements.get('mlv-week') || customElements.define('mlv-week', Week);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-week': Week;
  }
}
