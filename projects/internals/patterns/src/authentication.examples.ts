// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/alert-group/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/control-message/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/password/define.js';

export default {
  title: 'Patterns/Authentication',
  component: 'nve-patterns'
};


/**
 * @summary Login form with email and password fields with credential validation. Use for authentication entry points where real-time feedback guides users through sign-in requirements.
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
    alert.innerText = 'Login successful - ' + email;
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
 * @summary Full login page layout with centered card form using nve-page for responsive page structure.
 */
export const LoginPage = {
  render() {
    return html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 slot="prefix" nve-text="heading sm">Developer Portal</h2>
    <nve-button container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">APIs</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
    <nve-icon-button slot="suffix" container="flat" icon-name="search" aria-label="search"></nve-icon-button>
    <nve-icon-button slot="suffix" container="flat" icon-name="switch-apps" aria-label="applications"></nve-icon-button>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg align:center align:vertical-center">
    <form id="login-page-form">
      <nve-card style="width: 350px">
        <nve-card-header>
          <h2 nve-text="heading sm medium">Login</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:md">
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

            <nve-alert-group hidden status="success">
              <nve-alert></nve-alert>
            </nve-alert-group>
          </div>
        </nve-card-content>
        <nve-card-footer>
          <nve-button form="login-page-form" disabled style="width: 100%">login to account</nve-button>
        </nve-card-footer>
      </nve-card>
    </form>
  </main>
</nve-page>
<script type="module">
  const form = document.querySelector('form#login-page-form');
  const alertGroup = document.querySelector('#login-page-form nve-alert-group');
  const alert = document.querySelector('#login-page-form nve-alert');
  const button = document.querySelector('nve-button[form="login-page-form"]');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));
    alert.innerText = 'Login successful - ' + email;
    alertGroup.hidden = false;
  });

  form.addEventListener('input', e => {
    button.disabled = form.matches(':invalid');
  });
</script>
    `
  }
}


/**
 * @summary Use for permission denied states informing users of access restrictions with a contact option.
 * @tags pattern
 */
export const NoAccess = {
  render: () => html`
    <div nve-layout="column gap:lg pad:lg align:center">
      <nve-icon name="lock" size="xl"></nve-icon>
      <div nve-layout="column align:center gap:sm">
        <h2 nve-text="heading lg">Access Restricted</h2>
        <p nve-text="body muted center" style="max-width: 400px">
          You don't have permission to view this configuration. Contact your administrator to request access.
        </p>
      </div>
      <nve-button >Request Access</nve-button>
    </div>
  `
};
