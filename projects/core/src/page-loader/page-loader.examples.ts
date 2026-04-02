// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/page-loader/define.js';

export default {
  title: 'Elements/Page Loader',
  component: 'nve-page-loader',
};

/**
 * @summary Full-page loading indicator displaying centered spinner for initial page load states.
 */
export const Default = {
  render: () => html`
<nve-page-loader></nve-page-loader>
  `
};

/**
 * @summary Interactive page loader that starts programmatically via button click. Use when user actions such as form submissions, data refreshes, or navigation events start loading states rather than on initial page load.
 */
export const Interactive = {
  inline: false,
  render: () => html`
<nve-button id="loader-btn">trigger loader</nve-button>
<nve-page-loader hidden></nve-page-loader>

<script type="module">
  let loader = document.querySelector('nve-page-loader');
  let btn = document.querySelector('#loader-btn');
  btn.addEventListener('click', () => loader.hidden = false);
</script>
  `
};