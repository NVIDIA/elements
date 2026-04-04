// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/skeleton/define.js';

export default {
  title: 'Elements/Skeleton',
  component: 'nve-skeleton',
};

/**
 * @summary Basic skeleton component for text content. Placeholder lines appear while content loads.
 */
export const Default = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton style="width: 90%"></nve-skeleton>
  <nve-skeleton style="width: 80%"></nve-skeleton>
</div>`
};

/**
 * @summary Skeleton loading effects including pulse and shimmer animations. Use pulse for subtle breathing motion or shimmer for a scanning highlight that conveys active content loading.
 */
export const Effect = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton effect="pulse"></nve-skeleton>
  <nve-skeleton effect="shimmer"></nve-skeleton>
</div>`
}

/**
 * @summary Skeleton shape variants including default rectangle, pill, and round. Use pill for button or tag placeholders and round for avatar or icon placeholders to match the final content shape.
 */
export const Shape = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton shape="pill"></nve-skeleton>
  <nve-skeleton shape="round" style="width: 40px; height: 40px;"></nve-skeleton>
</div>`
}

/**
 * @summary Skeleton with slotted content that automatically hides the placeholder when real content arrives. Use to wrap lazy-loaded content so the skeleton disappears once data loads without manual state management.
 */
export const Slotted = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton effect="shimmer">slotting content will hide the skeleton</nve-skeleton>
  <nve-skeleton effect="shimmer">  </nve-skeleton>
</div>`
}
