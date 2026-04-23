// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/sort-button/define.js';

export default {
  title: 'Elements/Sort Button',
  component: 'nve-sort-button',
};

/**
 * @summary Basic sort button in its default unsorted state for column header sorting controls.
 */
export const Default = {
  render: () => html`
<nve-sort-button></nve-sort-button>`
};

/**
 * @summary Sort button states (unsorted, ascending, descending) displayed on light theme background.
 * @tags test-case
 */
export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md align:wrap">
  <nve-sort-button></nve-sort-button>
  <nve-sort-button sort="ascending"></nve-sort-button>
  <nve-sort-button sort="descending"></nve-sort-button>
</div>
  `
}

/**
 * @summary Sort button states (unsorted, ascending, descending) displayed on dark theme background.
 * @tags test-case
 */
export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md align:wrap">
  <nve-sort-button></nve-sort-button>
  <nve-sort-button sort="ascending"></nve-sort-button>
  <nve-sort-button sort="descending"></nve-sort-button>
</div>
  `
}