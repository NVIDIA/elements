import { Range } from '@elements/elements/range';
import '@elements/elements/forms/define.js';

customElements.get('mlv-range') || customElements.define('mlv-range', Range);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-range': Range;
  }
}
