// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/pulse/define.js';

export default {
  title: 'Elements/Pulse',
  component: 'nve-pulse',
};

/**
 * @summary Animated pulse indicator with aria-label for accessibility. Use to draw attention to live updates, active connections, or real-time status.
 */
export const Default = {
  render: () => html`
    <div nve-layout="row align:center">
      <nve-pulse aria-label="pulse component"></nve-pulse>
    </div>
`};

/**
 * @summary Pulse status variants for different severity levels. Use accent for highlights, warning for caution states, and danger for critical alerts.
 */
export const Status = {
  render: () => html`
    <div nve-layout="row gap:sm pad:md">
      <nve-pulse></nve-pulse>
      <nve-pulse status="accent"></nve-pulse>
      <nve-pulse status="warning"></nve-pulse>
      <nve-pulse status="danger"></nve-pulse>
    </div>
`};

/**
 * @summary Pulse size variants from extra-small to large. Choose sizes based on context—smaller for inline indicators, larger for prominent status displays.
 * @tags test-case
 */
export const Size = {
  render: () => html`
    <div nve-layout="row align:center">
      <nve-pulse size="xs"></nve-pulse>
      <nve-pulse size="sm"></nve-pulse>
      <nve-pulse size="md"></nve-pulse>
      <nve-pulse size="lg"></nve-pulse>
    </div>
`};

/**
 * @summary Pulse used inline with text labels. Ideal for status indicators in lists, tables, or headers to show real-time or live states.
 */
export const Inline = {
  render: () => html`
    <div nve-layout="row gap:xs align:center">
      <nve-pulse status="danger"></nve-pulse>
      Live Status
    </div>
  `
}