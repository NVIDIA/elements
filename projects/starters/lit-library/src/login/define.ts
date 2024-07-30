import { DomainLogin } from './login.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/forms/define.js';

customElements.get('domain-login') || customElements.define('domain-login', DomainLogin);

declare global {
  interface HTMLElementTagNameMap {
    ['domain-login']: DomainLogin;
  }
}
