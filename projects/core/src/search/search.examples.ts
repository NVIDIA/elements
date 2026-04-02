// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/search/define.js';

export default {
  title: 'Elements/Search',
  component: 'nve-search',
};

/**
 * @summary Basic search input with label and message for query entry and filtering data.
 */
export const Default = {
  render: () => html`
<nve-search>
  <label>label</label>
  <input type="search" />
  <nve-control-message>message</nve-control-message>
</nve-search>`
};

/**
 * @summary Rounded search input without visible label for compact inline placement in headers or toolbars.
 */
export const Inline = {
  render: () => html`
<nve-search rounded>
  <input type="search" aria-label="search" placeholder="search" />
</nve-search>`
};

/**
 * @summary Search input with datalist providing autocomplete suggestions for quick query selection from recent searches.
 */
export const Datalist = {
  render: () => html`
<nve-search rounded>
  <input type="search" aria-label="search" placeholder="search" />
  <datalist>
    <option value="search result 1"></option>
    <option value="search result 2"></option>
    <option value="search result 3"></option>
  </datalist>
</nve-search>`
};

/**
 * @summary Search inputs with vertical layout including validation states for disabled, success, and error.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-search>
    <label>label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search>
    <label>disabled</label>
    <input type="search" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search>
    <label>success</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-search>

  <nve-search>
    <label>error</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-search>
</div>`
};

/**
 * @summary Search inputs with horizontal layout showing validation states for inline forms and compact layouts.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-search layout="horizontal">
    <label>label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>disabled</label>
    <input type="search" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>success</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>error</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-search>
</div>`
};
