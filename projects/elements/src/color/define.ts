import { Color } from '@elements/elements/color';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-color') || customElements.define('nve-color', Color);

declare global {
  interface HTMLElementTagNameMap {
    'nve-color': Color;
  }
}
