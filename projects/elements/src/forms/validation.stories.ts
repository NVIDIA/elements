import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import { query } from 'lit/decorators/query.js';
import layout from '@nvidia-elements/core/css/module.layout.css?inline';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/password/define.js';

export default {
  title: 'Foundations/Forms/Examples',
};

export const Validation = () => {
  return html`
<form id="validation" nve-layout="column gap:md" style="max-width: 350px;">
  <mlv-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <mlv-control-message error="valueMissing">required</mlv-control-message>
    <mlv-control-message error="patternMismatch">invalid NVIDIA email</mlv-control-message>
  </mlv-input>

  <mlv-password>
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <mlv-control-message error="valueMissing">required</mlv-control-message>
    <mlv-control-message error="tooShort">minimum length is 6 characters</mlv-control-message>
  </mlv-password>

  <mlv-button disabled>login to account</mlv-button>

  <mlv-alert-group hidden status="success">
    <mlv-alert></mlv-alert>
  </mlv-alert-group>
</form>
<script type="module">
  const form = document.querySelector('form#validation');
  const alertGroup = document.querySelector('#validation mlv-alert-group');
  const alert = document.querySelector('#validation mlv-alert');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));
    alert.innerText = email + ' / ' + password;
    alertGroup.hidden = false;
  });

  form.addEventListener('input', e => {
    form.querySelector('mlv-button').disabled = form.matches(':invalid');
  });
</script>
`;
}

export const ValidationErrorGroup = () => {
  return html`
<form nve-layout="column gap:md" style="max-width: 350px;" novalidate>
  <mlv-input status="error">
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <mlv-control-message status="error">invalid email</mlv-control-message>
  </mlv-input>

  <mlv-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <mlv-control-message status="error">minimum length is 6 characters</mlv-control-message>
  </mlv-password>

  <mlv-button>login to account</mlv-button>

  <mlv-alert-group status="danger">
    <mlv-alert>invalid email</mlv-alert>
    <mlv-alert>password required</mlv-alert>
  </mlv-alert-group>
</form>
`;
}

export const ValidationSuccessGroup = () => {
  return html`
<form nve-layout="column gap:md" style="max-width: 350px;" novalidate>
  <mlv-input>
    <label>username</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <mlv-control-message status="success">username available</mlv-control-message>
  </mlv-input>

  <mlv-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
  </mlv-password>

  <mlv-button>login to account</mlv-button>

  <mlv-alert-group status="success">
    <mlv-alert closable>account created</mlv-alert>
  </mlv-alert-group>
</form>
`;
}

export const ValidationReset = () => {
  return html`
<form nve-layout="column gap:md" style="max-width: 350px;">
  <mlv-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" value="test@nvidia.com" />
    <mlv-icon-button aria-label="reset" icon-name="cancel" container="flat" type="button"></mlv-icon-button>
    <mlv-control-message error="valueMissing">required</mlv-control-message>
    <mlv-control-message error="patternMismatch">invalid NVIDIA email</mlv-control-message>
  </mlv-input>

  <mlv-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <mlv-control-message error="valueMissing">required</mlv-control-message>
  </mlv-password>

  <mlv-button type="button">reset form</mlv-button>
</form>
<script type="module">
  const form = document.querySelector('form');
  const input = form.querySelector('mlv-input');
  const resetInput = form.querySelector('mlv-icon-button[icon-name="cancel"]');
  const resetForm = form.querySelector('mlv-button');

  resetInput.addEventListener('click', e => input.reset());
  resetForm.addEventListener('click', e => form.reset());
  form.addEventListener('reset', e => console.log(e));
</script>
`;
}


@customElement('app-login')
export class AppLogin extends LitElement {
  static styles = [unsafeCSS(layout)];

  @query('form') form: HTMLFormElement;

  @state() formValues = { email: '', password: '', remember: false };

  @state() showNotification = false;

  render() {
    return html`
      <form @submit=${e => this.#submit(e)} @input=${this.#input} nve-layout="column gap:lg align:stretch" style="max-width: 400px">
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

        <mlv-button interaction="emphasis">Login</mlv-button>
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
