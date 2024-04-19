import { DomainLogin } from 'extensions-elements-starter/login';

customElements.get('domain-login') || customElements.define('domain-login', DomainLogin);

declare global {
  interface HTMLElementTagNameMap {
    ['domain-login']: DomainLogin;
  }
}
