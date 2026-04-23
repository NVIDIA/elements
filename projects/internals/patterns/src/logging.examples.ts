// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Patterns/Logging',
  component: 'nve-patterns'
};

/**
 * @summary Chronological event timeline with severity-coded entries for monitoring system events. Use for reviewing operational logs where temporal ordering and quick severity scanning are critical.
 * @tags pattern
 */
export const EventTimeline = {
  render: () => html`
<div nve-layout="column gap:lg">
  <div nve-layout="column gap:xs">
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-badge status="failed">09:17:45</nve-badge>
      <span nve-text="body semibold">Network Connection Lost</span>
    </div>
    <p nve-text="body sm muted">NetworkManager failed to connect to vehicle command server (NET_1001)</p>
    <div nve-layout="row gap:xs">
      <nve-badge container="flat">NetworkManager</nve-badge>
      <nve-badge container="flat">AV-001-Alpha</nve-badge>
    </div>
  </div>
  <div nve-layout="column gap:xs">
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-badge status="warning">09:16:12</nve-badge>
      <span nve-text="body semibold">Sensor Calibration Warning</span>
    </div>
    <p nve-text="body sm muted">LiDAR sensor temperature approaching threshold (51°C)</p>
    <div nve-layout="row gap:xs">
      <nve-badge container="flat">LiDARManager</nve-badge>
      <nve-badge container="flat">AV-001-Alpha</nve-badge>
    </div>
  </div>
  <div nve-layout="column gap:xs">
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-badge status="success">09:15:28</nve-badge>
      <span nve-text="body semibold">GPS Lock Acquired</span>
    </div>
    <p nve-text="body sm muted">GPS module successfully acquired satellite lock with 12 satellites</p>
    <div nve-layout="row gap:xs">
      <nve-badge container="flat">GPSManager</nve-badge>
      <nve-badge container="flat">AV-001-Alpha</nve-badge>
    </div>
  </div>
  <div nve-layout="column gap:xs">
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-badge status="pending">09:14:45</nve-badge>
      <span nve-text="body semibold">Camera Initialization Started</span>
    </div>
    <p nve-text="body sm muted">Starting camera array initialization sequence (8 cameras)</p>
    <div nve-layout="row gap:xs">
      <nve-badge container="flat">CameraManager</nve-badge>
      <nve-badge container="flat">AV-001-Alpha</nve-badge>
    </div>
  </div>
</div>
  `
};
