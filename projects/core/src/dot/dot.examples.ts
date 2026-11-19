// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/dot/define.js';

export default {
  title: 'Elements/Dot',
  component: 'nve-dot',
};

/**
 * @summary Basic dot component with status indicator, providing a simple visual cue for process states and system status.
 */
export const Default = {
  render: () => html`
<nve-dot status="starting"></nve-dot>
  `
};

/**
 * @summary Different dot sizes to accommodate layout contexts from compact indicators to prominent status displays.
 * @tags test-case
 */
export const Size = {
  render: () => html`
<div nve-layout="row gap:sm">
  <nve-dot size="sm">10</nve-dot>
  <nve-dot>10</nve-dot>
  <nve-dot size="lg">10</nve-dot>
</div>
<br>
<div nve-layout="row gap:lg">
  <nve-dot size="sm"></nve-dot>
  <nve-dot></nve-dot>
  <nve-dot size="lg"></nve-dot>
</div>
  `
}

/**
 * @summary Semantic color variations for general status communication, enabling clear visual distinction of different states and priorities.
 */
export const SupportStatus = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot></nve-dot>
  <nve-dot status="accent"></nve-dot>
  <nve-dot status="warning"></nve-dot>
  <nve-dot status="success"></nve-dot>
  <nve-dot status="danger"></nve-dot>
</div>
  `
}

/**
 * @summary Dot with numeric content for notification badges and counters, providing clear visual indicators of quantity or alerts.
 */
export const Number = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot>10</nve-dot>
  <nve-dot status="accent" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="warning" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="success" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="danger" aria-label="10 notifications">10</nve-dot>
</div>
  `
}

/**
 * @summary Comprehensive process status indicators for system operations, providing clear visual feedback on job states and workflow progress.
 */
export const Status = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot status="scheduled"></nve-dot>
  <nve-dot status="queued"></nve-dot>
  <nve-dot status="pending"></nve-dot>
  <nve-dot status="starting"></nve-dot>
  <nve-dot status="running"></nve-dot>
  <nve-dot status="restarting"></nve-dot>
  <nve-dot status="stopping"></nve-dot>
  <nve-dot status="finished"></nve-dot>
  <nve-dot status="failed"></nve-dot>
  <nve-dot status="unknown"></nve-dot>
</div>
  `
}

/**
 * @summary Dots in each palette color for category indicators. Use distinct colors to help users identify related content.
 * @tags test-case
 */
export const Color = {
  render: () => html`
<div nve-layout="row gap:md align:wrap">
  <nve-dot color="red-cardinal" aria-label="red-cardinal"></nve-dot>
  <nve-dot color="gray-slate" aria-label="gray-slate"></nve-dot>
  <nve-dot color="gray-denim" aria-label="gray-denim"></nve-dot>
  <nve-dot color="blue-indigo" aria-label="blue-indigo"></nve-dot>
  <nve-dot color="blue-cobalt" aria-label="blue-cobalt"></nve-dot>
  <nve-dot color="blue-sky" aria-label="blue-sky"></nve-dot>
  <nve-dot color="teal-cyan" aria-label="teal-cyan"></nve-dot>
  <nve-dot color="green-mint" aria-label="green-mint"></nve-dot>
  <nve-dot color="teal-seafoam" aria-label="teal-seafoam"></nve-dot>
  <nve-dot color="green-grass" aria-label="green-grass"></nve-dot>
  <nve-dot color="yellow-amber" aria-label="yellow-amber"></nve-dot>
  <nve-dot color="orange-pumpkin" aria-label="orange-pumpkin"></nve-dot>
  <nve-dot color="red-tomato" aria-label="red-tomato"></nve-dot>
  <nve-dot color="pink-magenta" aria-label="pink-magenta"></nve-dot>
  <nve-dot color="purple-plum" aria-label="purple-plum"></nve-dot>
  <nve-dot color="purple-violet" aria-label="purple-violet"></nve-dot>
  <nve-dot color="purple-lavender" aria-label="purple-lavender"></nve-dot>
  <nve-dot color="pink-rose" aria-label="pink-rose"></nve-dot>
  <nve-dot color="green-jade" aria-label="green-jade"></nve-dot>
  <nve-dot color="lime-pear" aria-label="lime-pear"></nve-dot>
  <nve-dot color="yellow-nova" aria-label="yellow-nova"></nve-dot>
  <nve-dot color="brand-green" aria-label="brand-green"></nve-dot>
</div>
  `
};

/**
 * @summary Circle and square indicators for distinct categories. Use shape alongside color to help users distinguish related content.
 * @tags test-case
 */
export const Shape = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot shape="circle" aria-label="Circle"></nve-dot>
  <nve-dot shape="square" aria-label="Square"></nve-dot>
</div>
  `
};
