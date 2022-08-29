import { Time } from '@elements/elements/time';
import '@elements/elements/forms/define.js';

customElements.get('mlv-time') || customElements.define('mlv-time', Time);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-time': Time;
  }
}
