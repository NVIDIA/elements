// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/ghost/define.js';

export default { title: 'Elements/Ghost', component: 'nve-ghost' };

/**
 * @summary Inert destination preview for indicating where dragged content can land. The containing layout controls its size and position.
 */
export const Destination = {
  render: () => html`<nve-ghost style="width:300px;height:180px"><span slot="label">Editor</span></nve-ghost>`
};

/**
 * @tags theme
 * @summary Compact carried preview with an opaque surface and a readable title. Use custom styles to distinguish content following the pointer from its proposed destination.
 */
export const Carried = {
  render: () =>
    html`<nve-ghost style="--background:var(--nve-sys-layer-container-background);--border:2px solid var(--nve-sys-accent-secondary-background);width:fit-content">Editor</nve-ghost>`
};
