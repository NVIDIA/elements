import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { scope } from '@elements/elements/internal';
import { Input } from '@elements/elements/input';
import { Password } from '@elements/elements/password';
import { Button } from '@elements/elements/button';
import '@webcomponents/scoped-custom-element-registry';
import './index.css';

@customElement('domain-login')
export class DomainLogin extends ScopedRegistryHost(LitElement) {
  static elementDefinitions = {
    'mlv-input': scope(Input, ScopedRegistryHost),
    'mlv-password': scope(Password, ScopedRegistryHost),
    'mlv-button': scope(Button, ScopedRegistryHost)
  }

  static styles = [css`
    :host {
      display: flex;
      flex-direction: column;
      width: 400px;
      gap: var(--mlv-ref-space-lg);
    }
  `]

  render() {
    return html`
      <mlv-input>
        <label>Email</label>
        <input type="email" />
      </mlv-input>

      <mlv-password>
        <label>Password</label>
        <input type="password" />
      </mlv-password>

      <mlv-button interaction="emphasize">Login</mlv-button>
    `;
  }
}
