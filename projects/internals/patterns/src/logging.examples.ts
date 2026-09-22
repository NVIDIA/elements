// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/toolbar/define.js';

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

/**
 * @summary Searchable chronological audit feed with severity filters and explicit actor, action, target, and source fields. Use when teams must reconstruct who changed what and where an event originated.
 * @tags pattern
 */
export const AuditFeed = {
  render() {
    return html`
<section id="audit-feed-pattern" nve-layout="column gap:md full" aria-labelledby="audit-feed-title" style="width: 100%;">
  <header nve-layout="column gap:xs">
    <h2 id="audit-feed-title" nve-text="heading md">Audit history</h2>
    <p nve-text="body sm muted">Review security and configuration activity across the workspace.</p>
  </header>
  <nve-toolbar content="wrap" aria-label="Audit history filters">
    <nve-search>
      <input id="audit-feed-search" type="search" aria-label="Search audit history" placeholder="Search actor, action, target, or source" />
    </nve-search>
    <nve-select fit-content>
      <select id="audit-feed-severity" aria-label="Severity">
        <option value="all">All severities</option>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="critical">Critical</option>
      </select>
    </nve-select>
    <nve-button id="audit-feed-clear" slot="suffix" container="flat" disabled>Clear filters</nve-button>
  </nve-toolbar>
  <p id="audit-feed-count" nve-text="body sm muted" aria-live="polite">5 events</p>
  <nve-grid container="flat" stripe aria-label="Audit events">
    <nve-grid-header>
      <nve-grid-column>Time</nve-grid-column>
      <nve-grid-column>Event</nve-grid-column>
      <nve-grid-column>Actor</nve-grid-column>
      <nve-grid-column>Action</nve-grid-column>
      <nve-grid-column>Target</nve-grid-column>
      <nve-grid-column>Severity</nve-grid-column>
      <nve-grid-column>Source</nve-grid-column>
    </nve-grid-header>
    <nve-grid-row data-audit-row data-severity="critical">
      <nve-grid-cell><time datetime="2026-09-21T14:32:18-05:00">14:32:18</time></nve-grid-cell>
      <nve-grid-cell>Access policy changed</nve-grid-cell>
      <nve-grid-cell>M. Chen</nve-grid-cell>
      <nve-grid-cell>Removed admin role</nve-grid-cell>
      <nve-grid-cell>robotics-prod</nve-grid-cell>
      <nve-grid-cell><nve-badge status="danger" container="flat">Critical</nve-badge></nve-grid-cell>
      <nve-grid-cell>Identity service</nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row data-audit-row data-severity="warning">
      <nve-grid-cell><time datetime="2026-09-21T14:24:06-05:00">14:24:06</time></nve-grid-cell>
      <nve-grid-cell>Deployment override</nve-grid-cell>
      <nve-grid-cell>A. Patel</nve-grid-cell>
      <nve-grid-cell>Bypassed approval</nve-grid-cell>
      <nve-grid-cell>vision-inspect-v4</nve-grid-cell>
      <nve-grid-cell><nve-badge status="warning" container="flat">Warning</nve-badge></nve-grid-cell>
      <nve-grid-cell>Release manager</nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row data-audit-row data-severity="info">
      <nve-grid-cell><time datetime="2026-09-21T14:10:42-05:00">14:10:42</time></nve-grid-cell>
      <nve-grid-cell>Dataset published</nve-grid-cell>
      <nve-grid-cell>Pipeline agent</nve-grid-cell>
      <nve-grid-cell>Published version 18</nve-grid-cell>
      <nve-grid-cell>loading-dock-images</nve-grid-cell>
      <nve-grid-cell><nve-badge status="accent" container="flat">Info</nve-badge></nve-grid-cell>
      <nve-grid-cell>Data pipeline</nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row data-audit-row data-severity="warning">
      <nve-grid-cell><time datetime="2026-09-21T13:58:11-05:00">13:58:11</time></nve-grid-cell>
      <nve-grid-cell>Secret rotated</nve-grid-cell>
      <nve-grid-cell>S. Okafor</nve-grid-cell>
      <nve-grid-cell>Rotated credential</nve-grid-cell>
      <nve-grid-cell>inference-gateway</nve-grid-cell>
      <nve-grid-cell><nve-badge status="warning" container="flat">Warning</nve-badge></nve-grid-cell>
      <nve-grid-cell>Secrets manager</nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row data-audit-row data-severity="info">
      <nve-grid-cell><time datetime="2026-09-21T13:41:27-05:00">13:41:27</time></nve-grid-cell>
      <nve-grid-cell>Workspace setting updated</nve-grid-cell>
      <nve-grid-cell>J. Rivera</nve-grid-cell>
      <nve-grid-cell>Changed retention to 90 days</nve-grid-cell>
      <nve-grid-cell>simulation-lab</nve-grid-cell>
      <nve-grid-cell><nve-badge status="accent" container="flat">Info</nve-badge></nve-grid-cell>
      <nve-grid-cell>Workspace settings</nve-grid-cell>
    </nve-grid-row>
  </nve-grid>
</section>
<script type="module">
  const root = document.querySelector('#audit-feed-pattern');
  if (root) {
    const search = root.querySelector('#audit-feed-search');
    const severity = root.querySelector('#audit-feed-severity');
    const clear = root.querySelector('#audit-feed-clear');
    const count = root.querySelector('#audit-feed-count');
    const rows = [...root.querySelectorAll('[data-audit-row]')];
    const update = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach(row => {
        const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
        const matchesSeverity = severity.value === 'all' || row.dataset.severity === severity.value;
        row.hidden = !(matchesQuery && matchesSeverity);
        if (!row.hidden) visible += 1;
      });
      count.textContent = visible + (visible === 1 ? ' event' : ' events');
      clear.disabled = !query && severity.value === 'all';
    };
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    clear.addEventListener('click', () => {
      search.value = '';
      severity.value = 'all';
      update();
      search.focus();
    });
  }
</script>
    `;
  }
};
