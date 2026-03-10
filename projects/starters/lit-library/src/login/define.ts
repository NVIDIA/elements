import { define } from '../internal/index.js';
import { DomainLogin } from './login.js';

define('domain-login', DomainLogin);

declare global {
  interface HTMLElementTagNameMap {
    ['domain-login']: DomainLogin;
  }
}
