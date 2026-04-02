// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/month/define.js';
import '@nvidia-elements/core/datetime/define.js';

export default {
  title: 'Elements/Datetime',
  component: 'nve-datetime',
};

/**
 * @summary Basic datetime picker input with label and message for selecting both date and time values.
 */
export const Default = {
  render: () => html`
<nve-datetime>
  <label>date</label>
  <input type="datetime-local" />
  <nve-control-message>message</nve-control-message>
</nve-datetime>
`
};

/**
 * @summary Datetime picker with datalist providing suggested datetime options for quick selection from predefined values.
 */
export const Datalist = {
  render: () => html`
<nve-datetime>
  <label>label</label>
  <input type="datetime-local" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="2018-06-07T00:00"></option>
    <option value="2018-06-12T19:30"></option>
    <option value="2018-06-14T00:00"></option>
  </datalist>
</nve-datetime>
  `
}

/**
 * @summary Datetime pickers with vertical layout including validation states for disabled, success, and error.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-datetime>
    <label>label</label>
    <input type="datetime-local" />
    <nve-control-message>message</nve-control-message>
  </nve-datetime>

  <nve-datetime>
    <label>disabled</label>
    <input type="datetime-local" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-datetime>

  <nve-datetime>
    <label>success</label>
    <input type="datetime-local" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-datetime>

  <nve-datetime>
    <label>error</label>
    <input type="datetime-local" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-datetime>
</div>`
};

/**
 * @summary Datetime pickers with horizontal layout showing validation states for inline forms and compact layouts.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-datetime layout="horizontal">
    <label>label</label>
    <input type="datetime-local" />
    <nve-control-message>message</nve-control-message>
  </nve-datetime>

  <nve-datetime layout="horizontal">
    <label>disabled</label>
    <input type="datetime-local" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-datetime>

  <nve-datetime layout="horizontal">
    <label>success</label>
    <input type="datetime-local" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-datetime>

  <nve-datetime layout="horizontal">
    <label>error</label>
    <input type="datetime-local" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-datetime>
</div>`
};
