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
    'nve-input': scope(Input, ScopedRegistryHost),
    'nve-password': scope(Password, ScopedRegistryHost),
    'nve-button': scope(Button, ScopedRegistryHost)
  }

  static styles = [css`
    :host {
      display: flex;
      flex-direction: column;
      width: 400px;
      gap: var(--nve-ref-space-lg);
    }
  `]

  render() {
    return html`
      <nve-input>
        <label>Email</label>
        <input type="email" />
      </nve-input>

      <nve-password>
        <label>Password</label>
        <input type="password" />
      </nve-password>

      <nve-button interaction="emphasize">Login</nve-button>
    `;
  }
}
