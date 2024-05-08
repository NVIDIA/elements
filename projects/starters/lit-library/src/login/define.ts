import { DomainLogin } from './login.js';
import '@elements/elements/input/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/password/define.js';
import '@elements/elements/forms/define.js';

customElements.get('domain-login') || customElements.define('domain-login', DomainLogin);

declare global {
  interface HTMLElementTagNameMap {
    ['domain-login']: DomainLogin;
  }
}
