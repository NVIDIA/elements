import { Color } from '@elements/elements/color';
import '@elements/elements/forms/define.js';

customElements.get('mlv-color') || customElements.define('mlv-color', Color);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-color': Color;
  }
}
