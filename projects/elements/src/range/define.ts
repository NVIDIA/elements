import { Range } from '@elements/elements/range';
import '@elements/elements/forms/define.js';

customElements.get('nve-range') || customElements.define('nve-range', Range);

declare global {
  interface HTMLElementTagNameMap {
    'nve-range': Range;
  }
}
