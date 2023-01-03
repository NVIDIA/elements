import { defineElement } from '@elements/elements/internal';
import { Password } from '@elements/elements/password';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('mlv-password', Password);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-password': Password;
  }
}
