// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/drag-handle/define.js';

export default {
  title: 'Elements/Drag Handle',
  component: 'nve-drag-handle'
};

/**
 * @summary Labeled grip for application-defined dragging and reordering. Use when an item needs a dedicated move control.
 */
export const Default = {
  render: () => html`<nve-drag-handle aria-label="move item"></nve-drag-handle>`
};

/**
 * @summary Pressed grip for an item selected for movement. Use to show the handle state while the application manages reordering.
 */
export const Pressed = {
  render: () => html`<nve-drag-handle pressed aria-label="move item"></nve-drag-handle>`
};

/**
 * @summary Disabled grip for an item that cannot move. Use to keep the control visible while movement is unavailable.
 */
export const Disabled = {
  render: () => html`<nve-drag-handle disabled aria-label="move item"></nve-drag-handle>`
};
