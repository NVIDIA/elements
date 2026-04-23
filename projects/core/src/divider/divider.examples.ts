// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Divider',
  component: 'nve-divider',
};

/**
 * @summary Basic horizontal divider for separating content sections with a subtle line.
 */
export const Default = {
  render: () => html`
    <nve-divider></nve-divider>
  `
};

/**
 * @summary Divider with emphasis color styling for stronger visual separation between content sections.
 * @tags test-case
 */
export const Emphasis = {
  render: () => html`
    <nve-divider style="--color: var(--nve-ref-border-color-emphasis)"></nve-divider>
  `
};

/**
 * @summary Divider with muted color styling for subtle, low-contrast separation in dense layouts.
 * @tags test-case
 */
export const Muted = {
  render: () => html`
    <nve-divider style="--color: var(--nve-ref-border-color-muted)"></nve-divider>
  `
};

/**
 * @summary Vertical divider for separating horizontally arranged elements like toolbar buttons or inline actions.
 */
export const Vertical = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center" style="height: 50px">
      <nve-divider orientation="vertical"></nve-divider>
      <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
      <nve-icon-button icon-name="more-actions"></nve-icon-button>
    </div>
  `
};

/**
 * @summary Divider with custom rounded styling, thicker border, and accent color for decorative separation.
 * @tags test-case
 */
export const Rounded = {
  render: () => html`
    <nve-divider style="--size: var(--nve-ref-border-width-xl); --border-radius: var(--nve-ref-border-radius-xs); --color: var(--nve-sys-accent-secondary-background);"></nve-divider>
  `
};
