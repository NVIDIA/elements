// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/gauge/define.js';

export default {
  title: 'Elements/Gauge',
  component: 'nve-gauge',
};

/**
 * @summary 270-degree gauges for displaying system resource usage.
 */
export const Default = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-gauge value="50">50%</nve-gauge>
      <nve-gauge status="accent" value="66">66%</nve-gauge>
    </div>
`};

/**
 * @summary Shape variants compare the default 270-degree gauge with the compact half gauge for telemetry layouts with tighter vertical space.
 * @tags test-case
 */
export const Shape = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-gauge status="accent" value="66">66%</nve-gauge>
      <nve-gauge shape="half" status="accent" value="66">66%</nve-gauge>
    </div>
`};

/**
 * @summary Half shape variant for telemetry layouts with tighter vertical space.
 * @tags test-case
 */
export const ShapeHalf = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-gauge shape="half" value="66" size="sm">66%</nve-gauge>
      <nve-gauge shape="half" value="66">66%</nve-gauge>
      <nve-gauge shape="half" value="66" size="lg">66%</nve-gauge>
    </div>
`};

/**
 * @summary Half shape with needle thumb variant for rapidly changing values in confined spaces.
 * @tags test-case
 */
export const ShapeHalfNeedle = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-gauge shape="half" thumb="needle" value="66" size="sm">66%</nve-gauge>
      <nve-gauge shape="half" thumb="needle" value="66">66%</nve-gauge>
      <nve-gauge shape="half" thumb="needle" value="66" size="lg">66%</nve-gauge>
    </div>
`};

/**
 * @summary Thumb variants compare filled, dot, and needle indicators for dashboards that need different levels of visual emphasis.
 * @tags test-case
 */
export const Thumb = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-gauge thumb="fill" value="66">fill</nve-gauge>
      <nve-gauge thumb="dot" value="66">dot</nve-gauge>
      <nve-gauge thumb="needle" value="66">needle</nve-gauge>
    </div>
`};

/**
 * @summary Gauges with values from 0% to 100% for displaying system resource usage.
 * @tags test-case
 */
export const Values = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-gauge value="0">0%</nve-gauge>
      <nve-gauge value="33">33%</nve-gauge>
      <nve-gauge value="66">66%</nve-gauge>
      <nve-gauge value="100">100%</nve-gauge>
    </div>
`};

/**
 * @summary Gauges with custom max values for mission checkpoints, validation clips, and map tile processing.
 * @tags test-case
 */
export const Max = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-gauge status="accent" max="20" value="5">5/20</nve-gauge>
      <nve-gauge max="20" value="10">10/20</nve-gauge>
      <nve-gauge max="20" value="15">15/20</nve-gauge>
    </div>
`};

/**
 * @summary Gauges with accent, success, warning, and danger colors for autonomous system health and readiness signals.
 * @tags test-case
 */
export const Status = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-gauge value="50">50%</nve-gauge>
      <nve-gauge status="accent" value="75">75%</nve-gauge>
      <nve-gauge status="success" value="75">75%</nve-gauge>
      <nve-gauge status="warning" value="75" aria-valuetext="2.1m">2.1m</nve-gauge>
      <nve-gauge status="danger" value="75" aria-valuetext="0Hz">0Hz</nve-gauge>
    </div>
`};

/**
 * @summary Use gradient colors for gauges with scaled non-segmented values such as temperature and bandwidth.
 * @tags pattern
 */
export const Gradient = {
  render: () => html`
    <style>
      nve-gauge#gauge-temperature-example {
        --background: conic-gradient(
          from 225deg at 50% 50%,
          var(--nve-sys-support-success-emphasis-color) 0deg 18deg,
          var(--nve-sys-support-warning-emphasis-color) 135deg,
          var(--nve-sys-support-danger-emphasis-color) 252deg 300deg,
          var(--nve-sys-support-success-emphasis-color) 300deg 360deg
        );
      }

      nve-gauge#gauge-mbps-example {
        --background: conic-gradient(
          from 225deg at 50% 50%,
          var(--nve-sys-support-danger-emphasis-color) 0deg 18deg,
          var(--nve-sys-support-warning-emphasis-color) 135deg,
          var(--nve-sys-support-success-emphasis-color) 252deg 300deg,
          var(--nve-sys-support-danger-emphasis-color) 300deg 360deg
        );
      }
    </style>

    <div nve-layout="row gap:md">
      <nve-gauge thumb="dot" value="82" id="gauge-temperature-example" aria-label="Temperature" aria-valuetext="82°C">
        <span>82&deg;C</span>
        <span nve-text="body sm muted">TEMP</span>
      </nve-gauge>

      <nve-gauge thumb="needle" value="98" id="gauge-mbps-example" aria-label="Download" aria-valuetext="980Mbps">
        <span nve-text="body sm">980Mbps</span>
        <span nve-text="body sm muted">Download</span>
      </nve-gauge>
    </div>
`};

/**
 * @summary Small gauge paired with route-solve text for compact autonomous vehicle task rows.
 * @tags test-case
 */
export const WithText = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center" nve-text="medium">
      <nve-gauge status="accent" size="sm" value="50" aria-labelledby="route-solve-label" aria-valuetext="2.4s">2.4s</nve-gauge>
      <span id="route-solve-label">Route solve</span>
    </div>
`};

/**
 * @summary Gauges in small, medium, and large sizes for dense robotics and autonomous vehicle dashboards.
 * @tags test-case
 */
export const Size = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-gauge size="sm" value="50" aria-valuetext="30Hz">
        <span nve-text="grow">30Hz</span>
      </nve-gauge>
      <nve-gauge size="md" value="50" aria-valuetext="12Hz">
        <span nve-text="grow">12Hz</span>
      </nve-gauge>
      <nve-gauge size="lg" value="50" aria-valuetext="84%">
        <span nve-text="grow">84%</span>
      </nve-gauge>
    </div>
`};

/**
 * @summary Use for displaying real-time system usage and performance metrics.
 * @tags pattern
 */
export const Dynamic = {
  render: () => html`
<div nve-layout="row gap:sm">
  <nve-gauge id="dynamic-gpu-gauge" status="success" value="0" aria-label="GPU" aria-valuetext="0%">
    <span nve-text="grow">0%</span>
    <span nve-text="body sm muted">GPU</span>
  </nve-gauge>
</div>
<script type="module">
  const gauge = document.querySelector('#dynamic-gpu-gauge');
  const valueElement = gauge.querySelector('span');
  setInterval(() => {
    const value = Math.floor(Math.random() * 101);
    const text = value + '%';
    gauge.value = value;
    gauge.status = value >= 80 ? 'danger' : value >= 60 ? 'warning' : 'success';
    gauge.setAttribute('aria-valuetext', text);
    valueElement.textContent = text;
  }, 1500);
</script>
`};

/**
 * @summary Autonomous vehicle taxi gauges combine battery, perception, compute, and link status with realistic drift. Use for live dispatch views that need changing system health.
 * @tags test-case
 */
export const MultiGauge = {
  render: () => html`
<div nve-layout="row gap:sm">
  <nve-gauge id="av-taxi-battery-gauge" status="success" value="74" aria-label="Battery" aria-valuetext="74%">
    <span nve-text="grow">74%</span>
    <span nve-text="body sm muted">BATTERY</span>
  </nve-gauge>
  <nve-gauge id="av-taxi-perception-gauge" status="success" value="96" aria-label="Perception" aria-valuetext="96%">
    <span nve-text="grow">96%</span>
    <span nve-text="body sm muted">PERCEPTION</span>
  </nve-gauge>
  <nve-gauge id="av-taxi-compute-gauge" status="success" value="62" aria-label="GPU" aria-valuetext="62%">
    <span nve-text="grow">62%</span>
    <span nve-text="body sm muted">GPU</span>
  </nve-gauge>
</div>
<script type="module">
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const telemetry = {
    battery: 74,
    compute: 62,
    perception: 96
  };
  const gauges = {
    battery: document.querySelector('#av-taxi-battery-gauge'),
    compute: document.querySelector('#av-taxi-compute-gauge'),
    perception: document.querySelector('#av-taxi-perception-gauge')
  };

  const setGauge = (gauge, value, text, status) => {
    gauge.value = Math.round(value);
    gauge.status = status;
    gauge.setAttribute('aria-valuetext', text);
    gauge.querySelector('span').textContent = text;
  };

  setInterval(() => {
    telemetry.battery = clamp(telemetry.battery - 0.08 + (Math.random() - 0.4) * 0.3, 46, 82);
    telemetry.compute = clamp(telemetry.compute + (Math.random() - 0.48) * 7, 34, 91);
    telemetry.perception = clamp(telemetry.perception + (Math.random() - 0.52) * 2.4, 88, 99);

    const battery = Math.round(telemetry.battery);
    const compute = Math.round(telemetry.compute);
    const perception = Math.round(telemetry.perception);

    setGauge(gauges.battery, battery, battery + '%', battery < 30 ? 'danger' : battery < 50 ? 'warning' : 'success');
    setGauge(gauges.compute, compute, compute + '%', compute >= 85 ? 'danger' : compute >= 70 ? 'warning' : 'success');
    setGauge(gauges.perception, perception, perception + '%', perception < 90 ? 'danger' : perception < 94 ? 'warning' : 'success');
  }, 1600);
</script>
`};
