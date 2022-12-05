import { Time } from '@elements/elements/time';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-time') || customElements.define('nve-time', Time);

declare global {
  interface HTMLElementTagNameMap {
    'nve-time': Time;
  }
}
