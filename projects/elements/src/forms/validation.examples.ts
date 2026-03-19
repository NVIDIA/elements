// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import { query } from 'lit/decorators/query.js';
import layout from '@nvidia-elements/styles/layout.css?inline';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/password/define.js';

export default {
  title: 'Elements/Forms',
  component: 'forms'
};

/**
 * @summary Use real-time validation with contextual error messages to disable submit until form is valid.
 * @tags pattern
 */
export const LoginForm = {
  render() {
    return html`
<form id="validation" nve-layout="column gap:md" style="max-width: 350px;">
  <nve-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
  </nve-input>

  <nve-password>
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="tooShort">minimum length is 6 characters</nve-control-message>
  </nve-password>

  <nve-button disabled>login to account</nve-button>

  <nve-alert-group hidden status="success">
    <nve-alert></nve-alert>
  </nve-alert-group>
</form>
<script type="module">
  const form = document.querySelector('form#validation');
  const alertGroup = document.querySelector('#validation nve-alert-group');
  const alert = document.querySelector('#validation nve-alert');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));
    alert.innerText = email + ' / ' + password;
    alertGroup.hidden = false;
  });

  form.addEventListener('input', e => {
    form.querySelector('nve-button').disabled = form.matches(':invalid');
  });
</script>
    `
  }
}

/**
 * @summary Login form with grouped error display showing all validation issues together after submission attempt.
 */
export const ErrorGroup = {
  render: () => html`
<form nve-layout="column gap:md" style="max-width: 350px;" novalidate>
  <nve-input status="error">
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message status="error">invalid email</nve-control-message>
  </nve-input>

  <nve-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <nve-control-message status="error">minimum length is 6 characters</nve-control-message>
  </nve-password>

  <nve-button>login to account</nve-button>

  <nve-alert-group status="danger">
    <nve-alert>invalid email</nve-alert>
    <nve-alert>password required</nve-alert>
  </nve-alert-group>
</form>
  `
}

/**
 * @summary Login form example of success feedback with positive confirmation messages for valid input and successful form submission.
 */
export const SuccessGroup = {
  render: () => {
    return html`
<form nve-layout="column gap:md" style="max-width: 350px;" novalidate>
  <nve-input>
    <label>username</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message status="success">username available</nve-control-message>
  </nve-input>

  <nve-password>
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
  </nve-password>

  <nve-button>login to account</nve-button>

  <nve-alert-group status="success">
    <nve-alert closable>account created</nve-alert>
  </nve-alert-group>
</form>
`
  }
}

/**
 * @summary Form reset functionality allowing users to clear individual fields or reset the entire form.
 */
export const ResetForm = {
  render: () => {
    return html`
<form nve-layout="column gap:md" style="max-width: 350px;">
  <nve-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" value="test@nvidia.com" />
    <nve-icon-button aria-label="reset" icon-name="cancel" container="flat" type="button"></nve-icon-button>
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
  </nve-input>

  <nve-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
  </nve-password>

  <nve-button type="button">reset form</nve-button>
</form>
<script type="module">
  const form = document.querySelector('form');
  const input = form.querySelector('nve-input');
  const resetInput = form.querySelector('nve-icon-button[icon-name="cancel"]');
  const resetForm = form.querySelector('nve-button');

  resetInput.addEventListener('click', e => input.reset());
  resetForm.addEventListener('click', e => form.reset());
  form.addEventListener('reset', e => console.log(e));
</script>
`
  }
}

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

@customElement('app-login')
export class AppLogin extends LitElement {
  static styles = [unsafeCSS(layout)];

  @query('form') form: HTMLFormElement;

  @state() formValues = { email: '', password: '', remember: false };

  @state() showNotification = false;

  render() {
    return html`
      <form @submit=${e => this.#submit(e)} @input=${this.#input} nve-layout="column gap:lg align:stretch" style="max-width: 400px">
        <nve-input>
          <label>Email</label>
          <input .value=${this.formValues.email} type="email" name="email" autocomplete="off" pattern=".+@nvidia.com" required />
          <nve-control-message error="valueMissing">required</nve-control-message>
          <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
        </nve-input>

        <nve-password>
          <label>Password</label>
          <input .value=${this.formValues.password} type="password" name="password" minlength="6" required />
          <nve-control-message error="valueMissing">required</nve-control-message>
          <nve-control-message error="tooShort">minimum length is 6 characters</nve-control-message>
        </nve-password>

        <nve-checkbox>
          <label>Remember me</label>
          <input ?checked=${this.formValues.remember} type="checkbox" name="remember" />
        </nve-checkbox>

        <nve-button interaction="emphasis">Login</nve-button>
      </form>
      <pre>${JSON.stringify(this.formValues, null, 2)}</pre>
      <nve-notification ?hidden=${!this.showNotification} @close=${() => this.showNotification = false} close-timeout="2000" status="success" position="top">Submited: ${JSON.stringify(this.formValues)}</nve-notification>
    `;
  }

  #input() {
    this.formValues = Object.fromEntries(new FormData(this.form)) as unknown as { email: string, password: string, remember: boolean };
  }

  #submit(e) {
    e.preventDefault();
    if (this.form.reportValidity()) {
      this.showNotification = true
    }
  }
}

/**
 * @summary Forms work with LitElement
 * @tags test-case
 */
export const LitForms = {
  render: () => html`<app-login></app-login>`
}
