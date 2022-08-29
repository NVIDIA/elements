import { Password } from '@elements/elements/password';
import '@elements/elements/forms/define.js';

customElements.get('mlv-password') || customElements.define('mlv-password', Password);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-password': Password;
  }
}
