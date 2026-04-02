// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Input',
  component: 'nve-input'
};

/**
 * @summary Basic text input field with label and message for general text entry and form data collection.
 */
export const Default = {
  render: () => html`
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

/**
 * @summary Text input with the standard input structure, label, and control message.
 */
export const Standard = {
  render: () => html`
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

/**
 * @summary Text inputs with vertical layout including validation states for disabled, success, and error.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-input>
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-input>
</div>`
};

/**
 * @summary Text inputs with horizontal layout showing validation states for inline forms and compact layouts.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-input layout="horizontal">
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-input>
</div>`
};

/**
 * @summary Text input with rounded corners for a softer visual appearance and modern aesthetic.
 */
export const Rounded = {
  render: () => html`
<nve-input rounded>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

/**
 * @summary Text input with fit-text styling that adjusts width to match the input value for compact displays.
 * @tags test-case
 */
export const FitText = {
  render: () => html`
<nve-input fit-text>
  <label>label</label>
  <input value="123456789012345678901234567890" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

/**
 * @summary Text input with fit-content sizing that automatically adjusts width based on available space.
 * @tags test-case
 */
export const FitContent = {
  render: () => html`
<nve-input fit-content>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

/**
 * @summary Text input with flat container styling for minimal visual appearance and borderless design.
 */
export const Flat = {
  render: () =>
    html`
<nve-input container="flat">
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`,
};