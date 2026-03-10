import { DomainLogin } from './login.js';

customElements.get('domain-login') || customElements.define('domain-login', DomainLogin);

declare global {
  interface HTMLElementTagNameMap {
    ['domain-login']: DomainLogin;
  }
}
