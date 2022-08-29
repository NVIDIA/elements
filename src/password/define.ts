import { Password } from '@elements/elements/password';
import '@elements/elements/forms/define.js';

customElements.get('nve-password') || customElements.define('nve-password', Password);

declare global {
  interface HTMLElementTagNameMap {
    'nve-password': Password;
  }
}
