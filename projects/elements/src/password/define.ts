import { define } from '@elements/elements/internal';
import { Password } from '@elements/elements/password';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Password);

declare global {
  interface HTMLElementTagNameMap {
    'nve-password': Password;
  }
}
