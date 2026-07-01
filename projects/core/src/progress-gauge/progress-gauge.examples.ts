// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/progress-gauge/define.js';

export default {
  title: 'Elements/Progress Gauge',
  component: 'nve-progress-gauge',
};

/**
 * @summary 270-degree progress gauges for displaying system resource usage.
 */
export const Default = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-gauge value="50">50%</nve-progress-gauge>
      <nve-progress-gauge status="accent" value="66">66%</nve-progress-gauge>
    </div>
`};

/**
 * @summary Container variants compare the default 270-degree gauge with the compact half gauge for telemetry layouts with tighter vertical space.
 * @tags test-case
 */
export const Container = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-progress-gauge status="accent" value="66">66%</nve-progress-gauge>
      <nve-progress-gauge container="half" status="accent" value="66">66%</nve-progress-gauge>
    </div>
`};

/**
 * @summary Gauges with values from 0% to 100% for displaying system resource usage.
 * @tags test-case
 */
export const Values = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-gauge value="0">0%</nve-progress-gauge>
      <nve-progress-gauge value="33">33%</nve-progress-gauge>
      <nve-progress-gauge value="66">66%</nve-progress-gauge>
      <nve-progress-gauge value="100">100%</nve-progress-gauge>
    </div>
`};

/**
 * @summary Progress gauges with custom max values for mission checkpoints, validation clips, and map tile processing.
 * @tags test-case
 */
export const Max = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-gauge status="accent" max="20" value="5">5/20</nve-progress-gauge>
      <nve-progress-gauge max="20" value="10">10/20</nve-progress-gauge>
      <nve-progress-gauge max="20" value="15">15/20</nve-progress-gauge>
    </div>
`};

/**
 * @summary Progress gauges with accent, success, warning, and danger colors for autonomous system health and readiness signals.
 * @tags test-case
 */
export const Status = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-gauge value="50">50%</nve-progress-gauge>
      <nve-progress-gauge status="accent" value="75">75%</nve-progress-gauge>
      <nve-progress-gauge status="success" value="75">75%</nve-progress-gauge>
      <nve-progress-gauge status="warning" value="75">2.1m</nve-progress-gauge>
      <nve-progress-gauge status="danger" value="75">0Hz</nve-progress-gauge>
    </div>
`};

/**
 * @summary Small progress gauge paired with route-solve text for compact autonomous vehicle task rows.
 * @tags test-case
 */
export const WithText = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center" nve-text="medium">
      <nve-progress-gauge status="accent" size="sm" value="50" aria-labelledby="route-solve-label">2.4s</nve-progress-gauge>
      <span id="route-solve-label">Route solve</span>
    </div>
`};

/**
 * @summary Progress gauges in small, medium, and large sizes for dense robotics and autonomous vehicle dashboards.
 * @tags test-case
 */
export const Sizing = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-gauge size="sm" value="50">30Hz</nve-progress-gauge>
      <nve-progress-gauge size="md" value="50">12Hz</nve-progress-gauge>
      <nve-progress-gauge size="lg" value="50">84%</nve-progress-gauge>
    </div>
`};

/**
 * @summary Use for displaying real-time system usage and performance metrics.
 * @tags pattern
 */
export const Dynamic = {
  render: () => html`
<div nve-layout="row gap:sm">
  <nve-progress-gauge id="dynamic-gpu-progress-gauge" status="success" value="0">
    <span>0%</span>
    <span nve-text="body sm muted">GPU</span>
  </nve-progress-gauge>
</div>
<script type="module">
  const gauge = document.querySelector('#dynamic-gpu-progress-gauge');
  const valueElement = gauge.querySelector('span');
  setInterval(() => {
    const value = Math.floor(Math.random() * 101);
    gauge.value = value;
    gauge.status = value >= 80 ? 'danger' : value >= 60 ? 'warning' : 'success';
    valueElement.textContent = value + '%';
  }, 1500);
</script>
`};
