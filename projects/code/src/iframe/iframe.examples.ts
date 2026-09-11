// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/code/iframe/define.js';

export default {
  title: 'Code/Iframe',
  component: 'nve-iframe'
};

/**
 * @summary Supplies the iframe with Elements themes, utilities, fonts, and component registrations through its head template. Use this structure because iframe documents do not inherit resources from the parent document.
 */
export const Default = {
  render: () => html`
<nve-iframe aria-label="Elements iframe example">
  <template slot="head">
    <title>Elements iframe example</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js"></script>
  </template>
  <template>
    <nve-alert status="success">isolated iframe content</nve-alert>
  </template>
</nve-iframe>
  `
};

/**
 * @summary Synchronizes the iframe height with expandable content so the host layout avoids empty space or internal scrollbars. Use for previews whose intrinsic height changes after interaction.
 * @tags test-case
 */
export const DynamicHeight = {
  render: () => html`
<nve-iframe aria-label="Dynamic height iframe example" style="--border: 1px solid red">
  <template slot="head">
    <title>Dynamic iframe height</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js"></script>
  </template>
  <template>
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Dynamic height in iframe</h2>
      </nve-accordion-header>
      <nve-accordion-content>
        The iframe expands when this content opens and contracts when it closes.
      </nve-accordion-content>
    </nve-accordion>
  </template>
</nve-iframe>
  `
};

/**
 * @summary Overrides intrinsic iframe dimensions with `--width` and `--height` to create a stable preview viewport. Use when you need to inspect embedded content at a fixed size regardless of its rendered bounds.
 * @tags test-case
 */
export const FixedSize = {
  render: () => html`
<nve-iframe aria-label="Fixed-size iframe example" style="--height: 256px; --width: 256px; --border: 1px solid red">
  <template><p style="height: 128px; width: 128px; margin: 1px; outline: 1px solid yellow;">override iframe size</p></template>
</nve-iframe>
  `
};

/**
 * @summary The iframe browsing-context boundary clips popovers at its viewport and prevents them from escaping. Keep overlays inside the frame, or render them outside the iframe when they must overlap surrounding content.
 * @tags test-case
 */
export const OverflowClip = {
  render: () => html`
<nve-iframe aria-label="Overflow clipping iframe example" style="--height: 150px; --border: 1px solid red">
  <template slot="head">
    <title>Clipped iframe popover</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js"></script>
  </template>
  <template>
    <div nve-layout="pad:md">
      <nve-dropdown id="dropdown">Popovers <strong>are clipped</strong> by the iframe.</nve-dropdown>
      <nve-button popovertarget="dropdown">Open popover</nve-button>
    </div>
  </template>
</nve-iframe>
  `
};

/**
 * @summary Regenerates the iframe document when its source template changes. Use for live previews or generated output that must stay synchronized with edits made in the parent document.
 * @tags test-case
 */
export const DynamicallyUpdatedContent = {
  render: () => html`
<nve-iframe id="property-example" aria-label="Dynamically updated iframe example">
  <template>
    <p nve-text="body">Initial iframe content.</p>
  </template>
</nve-iframe>
<script type="module">
  document.querySelector('#property-example template').innerHTML =
    '<p nve-text="body">This template was dynamically updated.</p>';
</script>
  `
};
