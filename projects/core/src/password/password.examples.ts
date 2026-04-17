// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/password/define.js';

export default {
  title: 'Elements/Password',
  component: 'nve-password',
};

/**
 * @summary Basic password input with toggle visibility for secure credential entry and authentication forms.
 */
export const Default = {
  render: () => html`
<nve-password>
  <label>label</label>
  <input type="password" value="123456" />
  <nve-control-message>message</nve-control-message>
</nve-password>`
};

/**
 * @summary Password inputs with vertical layout including validation states for disabled, success, and error.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-password>
    <label>label</label>
    <input type="password" value="123456" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password>
    <label>disabled</label>
    <input type="password" value="123456" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password>
    <label>success</label>
    <input type="password" value="123456" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-password>

  <nve-password>
    <label>error</label>
    <input type="password" value="123456" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-password>
</div>`
};

/**
 * @summary Password inputs with horizontal layout showing validation states for inline forms and compact layouts.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-password layout="horizontal">
    <label>label</label>
    <input type="password" value="123456" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>disabled</label>
    <input type="password" value="123456" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>success</label>
    <input type="password" value="123456" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>error</label>
    <input type="password" value="123456" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-password>
</div>`
};
