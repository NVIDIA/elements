import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import { query } from 'lit/decorators/query.js';
import typography from '@elements/elements/css/module.typography.css';
import layout from '@elements/elements/css/module.layout.css';
import '@elements/elements/notification/define.js';
import '@elements/elements/password/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/button/define.js';

export default {
  title: 'Internal/Integration'
};

@customElement('my-element')
class MyElementDemo extends LitElement {
  static styles = [unsafeCSS(`${typography}${layout}`)];

  render() {
    return html`
      <div mlv-layout="column gap:lg">
        <p mlv-text="display">display</p>
        <p mlv-text="heading">heading</p>
        <p mlv-text="body">body</p>
        <p mlv-text="label">label</p>
        <p mlv-text="eyebrow">eyebrow</p>
      </div>
    `;
  }
}

export const Lit = {
  render: () => html`<my-element></my-element>`
}

@customElement('app-login')
export class AppLogin extends LitElement {
  static styles = [unsafeCSS(layout)];

  @query('form') form: HTMLFormElement;

  @state() formValues = { email: '', password: '', remember: false };

  @state() showNotification = false;

  render() {
    return html`
      <form @submit=${e => this.#submit(e)} @input=${this.#input} mlv-layout="column gap:lg align:stretch" style="max-width: 400px">
        <mlv-input>
          <label>Email</label>
          <input .value=${this.formValues.email} type="email" name="email" autocomplete="off" pattern=".+@nvidia.com" required />
          <mlv-control-message error="valueMissing">required</mlv-control-message>
          <mlv-control-message error="patternMismatch">invalid NVIDIA email</mlv-control-message>
        </mlv-input>

        <mlv-password>
          <label>Password</label>
          <input .value=${this.formValues.password} type="password" name="password" minlength="6" required />
          <mlv-control-message error="valueMissing">required</mlv-control-message>
          <mlv-control-message error="tooShort">minimum length is 6 characters</mlv-control-message>
        </mlv-password>

        <mlv-checkbox>
          <label>Remember me</label>
          <input ?checked=${this.formValues.remember} type="checkbox" name="remember" />
        </mlv-checkbox>

        <mlv-button interaction="emphasize">Login</mlv-button>
      </form>
      <pre>${JSON.stringify(this.formValues, null, 2)}</pre>
      <mlv-notification ?hidden=${!this.showNotification} @close=${() => this.showNotification = false} close-timeout="2000" status="success" position="top">Submited: ${JSON.stringify(this.formValues)}</mlv-notification>
    `;
  }

  #input() {
    this.formValues = Object.fromEntries(new FormData(this.form)) as any;
  }

  #submit(e) {
    e.preventDefault();
    if (this.form.reportValidity()) {
      this.showNotification = true
    }
  }
}

export const LitForms = {
  render: () => html`<app-login></app-login>`
}

// used to trigger global option updates (theming) when all stories are isolated in iframes
export const Empty = {
  render: () => html``
}