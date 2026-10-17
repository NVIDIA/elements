// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/ghost/define.js';

export default { title: 'Elements/Ghost', component: 'nve-ghost' };

/**
 * @summary Show a visual preview of content before placement. Include recognizable content to help users identify the preview.
 */
export const Preview = {
  render: () => html`
<nve-ghost style="width:300px;max-width:100%;height:180px">
  <div nve-layout="column gap:md">
    <strong nve-text="heading">Notes</strong>
    <p nve-text="body">Review the training results and prepare the next run.</p>
  </div>
</nve-ghost>`
};

/**
 * @tags theme
 * @summary Compact carried preview with an opaque surface and a readable title. Customize the surface, border, and text color to distinguish carried content.
 */
export const Carried = {
  render: () => html`
<nve-ghost style="--background:var(--nve-sys-layer-container-background);--border:var(--nve-ref-border-width-md) solid var(--nve-sys-accent-secondary-background);--color:var(--nve-sys-text-emphasis-color);width:fit-content;max-width:100%;white-space:nowrap">Editor</nve-ghost>`
};

/**
 * @tags theme
 * @summary Show carried items as a compact stack with one label. Set layers to two or three and customize the offsets to adjust their separation.
 */
export const Stack = {
  render: () => html`
<nve-ghost layers="3" style="--background:var(--nve-sys-layer-container-background);--border:var(--nve-ref-border-width-md) solid var(--nve-sys-accent-secondary-background);width:fit-content;max-width:100%;white-space:nowrap">Editor</nve-ghost>`
};
