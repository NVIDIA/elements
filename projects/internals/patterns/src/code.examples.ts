// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/avatar/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/core/format-datetime/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/tree/define.js';

export default {
  title: 'Patterns/Code',
  component: 'nve-patterns'
};

/**
 * @summary Test run summary with expandable suites, individual results, and failure details. Use in coding assistants to make failed checks easy to find without hiding successful or skipped tests.
 * @tags pattern
 */
export const TestResults = {
  render: () => html`
<nve-card container="flat">
  <nve-card-header>
    <div nve-layout="row gap:sm align:wrap align:space-between full:width">
      <h2 nve-text="heading sm">Navigation tests</h2>
      <span nve-text="body sm muted">AMR-07 · 6 tests · 1.24 s</span>
    </div>
  </nve-card-header>
  <nve-card-content>
    <div nve-layout="column gap:sm align:horizontal-stretch">
      <div nve-layout="row gap:sm align:wrap" aria-label="Test totals">
        <nve-badge status="success">4 passed</nve-badge>
        <nve-badge status="failed">1 failed</nve-badge>
        <nve-badge status="ignored">1 skipped</nve-badge>
      </div>
      <nve-accordion container="flat" behavior-expand expanded>
        <nve-accordion-header>
          <span nve-text="body sm semibold">Obstacle avoidance</span>
          <nve-badge slot="suffix" status="failed" container="flat">1 failed</nve-badge>
        </nve-accordion-header>
        <nve-accordion-content>
          <div nve-layout="column gap:sm">
            <nve-grid container="flat" aria-label="Obstacle avoidance test results">
              <nve-grid-header>
                <nve-grid-column>Test</nve-grid-column>
                <nve-grid-column>Result</nve-grid-column>
              </nve-grid-header>
              <nve-grid-row>
                <nve-grid-cell><span nve-text="body sm">Routes around a pallet</span></nve-grid-cell>
                <nve-grid-cell>
                  <div nve-layout="column gap:xs full:width">
                    <nve-badge container="flat" status="success">Passed</nve-badge>
                    <span nve-text="body sm muted">120 ms</span>
                  </div>
                </nve-grid-cell>
              </nve-grid-row>
              <nve-grid-row>
                <nve-grid-cell><span nve-text="body sm">Stops for a nearby obstacle</span></nve-grid-cell>
                <nve-grid-cell>
                  <div nve-layout="column gap:xs full:width">
                    <nve-badge container="flat" status="failed">Failed</nve-badge>
                    <span nve-text="body sm muted">85 ms</span>
                  </div>
                </nve-grid-cell>
              </nve-grid-row>
              <nve-grid-row>
                <nve-grid-cell><span nve-text="body sm">Replans a blocked aisle</span></nve-grid-cell>
                <nve-grid-cell>
                  <div nve-layout="column gap:xs full:width">
                    <nve-badge container="flat" status="ignored">Skipped</nve-badge>
                    <span nve-text="body sm muted">—</span>
                  </div>
                </nve-grid-cell>
              </nve-grid-row>
            </nve-grid>
            <nve-alert status="danger">
              <div nve-layout="column gap:xs">
                <strong nve-text="body sm semibold">Stop distance exceeded</strong>
                <p nve-text="body sm">Expected ≤ 0.35 m; recorded 0.48 m in simulation.</p>
                <code nve-text="monospace sm muted">tests/test_navigation.py:42</code>
              </div>
            </nve-alert>
          </div>
        </nve-accordion-content>
      </nve-accordion>
      <nve-accordion container="flat" behavior-expand>
        <nve-accordion-header>
          <span nve-text="body sm semibold">Sensor fusion</span>
          <nve-badge slot="suffix" status="success" container="flat">3 passed</nve-badge>
        </nve-accordion-header>
        <nve-accordion-content>
          <nve-grid container="flat" aria-label="Sensor fusion test results">
            <nve-grid-header>
              <nve-grid-column>Test</nve-grid-column>
              <nve-grid-column>Result</nve-grid-column>
            </nve-grid-header>
            <nve-grid-row>
              <nve-grid-cell><span nve-text="body sm">Aligns camera and lidar frames</span></nve-grid-cell>
              <nve-grid-cell>
                <div nve-layout="column gap:xs full:width">
                  <nve-badge container="flat" status="success">Passed</nve-badge>
                  <span nve-text="body sm muted">24 ms</span>
                </div>
              </nve-grid-cell>
            </nve-grid-row>
            <nve-grid-row>
              <nve-grid-cell><span nve-text="body sm">Rejects stale lidar scans</span></nve-grid-cell>
              <nve-grid-cell>
                <div nve-layout="column gap:xs full:width">
                  <nve-badge container="flat" status="success">Passed</nve-badge>
                  <span nve-text="body sm muted">18 ms</span>
                </div>
              </nve-grid-cell>
            </nve-grid-row>
            <nve-grid-row>
              <nve-grid-cell><span nve-text="body sm">Tracks pose through a turn</span></nve-grid-cell>
              <nve-grid-cell>
                <div nve-layout="column gap:xs full:width">
                  <nve-badge container="flat" status="success">Passed</nve-badge>
                  <span nve-text="body sm muted">32 ms</span>
                </div>
              </nve-grid-cell>
            </nve-grid-row>
          </nve-grid>
        </nve-accordion-content>
      </nve-accordion>
    </div>
  </nve-card-content>
</nve-card>
  `
};

/**
 * @summary Expandable project files with single selection and keyboard navigation. Use when an assistant references repository content so users can explore folders and locate the active file.
 * @tags pattern
 */
export const FileTree = {
  render: () => html`
<nve-tree behavior-expand behavior-select selectable="single" aria-label="Robot workspace files">
  <nve-tree-node expanded>
    <nve-icon name="folder" slot="prefix"></nve-icon> src
    <nve-tree-node expanded>
      <nve-icon name="folder" slot="prefix"></nve-icon> navigation
      <nve-tree-node selected><nve-icon name="code" slot="prefix"></nve-icon> controller.py</nve-tree-node>
      <nve-tree-node><nve-icon name="code" slot="prefix"></nve-icon> planner.py</nve-tree-node>
    </nve-tree-node>
    <nve-tree-node>
      <nve-icon name="folder" slot="prefix"></nve-icon> perception
      <nve-tree-node><nve-icon name="code" slot="prefix"></nve-icon> fusion.py</nve-tree-node>
      <nve-tree-node><nve-icon name="code" slot="prefix"></nve-icon> lidar.py</nve-tree-node>
    </nve-tree-node>
  </nve-tree-node>
  <nve-tree-node>
    <nve-icon name="folder" slot="prefix"></nve-icon> config
    <nve-tree-node><nve-icon name="document" slot="prefix"></nve-icon> robot.yaml</nve-tree-node>
  </nve-tree-node>
  <nve-tree-node>
    <nve-icon name="folder" slot="prefix"></nve-icon> launch
    <nve-tree-node><nve-icon name="code" slot="prefix"></nve-icon> warehouse.launch.py</nve-tree-node>
  </nve-tree-node>
  <nve-tree-node><nve-icon name="document" slot="prefix"></nve-icon> package.xml</nve-tree-node>
  <nve-tree-node><nve-icon name="document" slot="prefix"></nve-icon> README.md</nve-tree-node>
</nve-tree>
  `
};

/**
 * @summary Commit details with author, copyable hash, and expandable file changes. Use after an assistant edits a repository to show the scope of a change and distinguish added, modified, deleted, and renamed files.
 * @tags pattern
 */
export const Commit = {
  render: () => html`
<div nve-layout="column gap:sm">
  <div nve-layout="row gap:sm align:wrap align:vertical-center full:width">
    <nve-avatar size="xs" aria-label="Upkeep Agent">NV</nve-avatar>
    <span nve-text="body sm">Upkeep Agent</span>
    <span nve-text="body sm muted"><nve-format-datetime date-style="medium">2026-10-05T14:30:00Z</nve-format-datetime></span>
    <nve-copy-button behavior-copy container="inline" size="sm" value="a1b2c3d4e5f678901234567890abcdef1234567890" aria-label="Copy commit hash">a1b2c3d</nve-copy-button>
  </div>
  <nve-grid container="flat" aria-label="Robot software commit changes">
    <nve-grid-header>
      <nve-grid-column>File</nve-grid-column>
      <nve-grid-column>Changes</nve-grid-column>
    </nve-grid-header>
    <nve-grid-row>
      <nve-grid-cell>
        <code nve-layout="full:width" nve-text="monospace sm truncate" title="perception/lidar.py">perception/lidar.py</code>
      </nve-grid-cell>
      <nve-grid-cell>
        <span nve-layout="row gap:xs align:wrap"><nve-badge container="flat" status="success">+24</nve-badge><nve-badge container="flat" status="failed">−8</nve-badge></span>
      </nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row>
      <nve-grid-cell>
        <code nve-layout="full:width" nve-text="monospace sm truncate" title="tests/test_lidar.py">tests/test_lidar.py</code>
      </nve-grid-cell>
      <nve-grid-cell>
        <span nve-layout="row gap:xs align:wrap"><nve-badge container="flat" status="success">+42</nve-badge></span>
      </nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row>
      <nve-grid-cell>
        <code nve-layout="full:width" nve-text="monospace sm truncate" title="perception/legacy.py">perception/legacy.py</code>
      </nve-grid-cell>
      <nve-grid-cell>
        <span nve-layout="row gap:xs align:wrap"><nve-badge container="flat" status="failed">−18</nve-badge></span>
      </nve-grid-cell>
    </nve-grid-row>
    <nve-grid-row>
      <nve-grid-cell>
        <code nve-layout="full:width" nve-text="monospace sm truncate" title="config/sensors.yaml">config/sensors.yaml</code>
      </nve-grid-cell>
      <nve-grid-cell>
        <span nve-layout="row gap:xs align:wrap align:vertical-center">
          <nve-badge container="flat" status="accent">Renamed</nve-badge> <span nve-text="body sm muted">from lidar.yaml</span>
        </span>
      </nve-grid-cell>
    </nve-grid-row>
  </nve-grid>
</div>
  `
};

/**
 * @summary Environment settings with masked values, visibility controls, required indicators, and copy actions. Use in developer tools to inspect configuration while keeping credentials hidden until requested.
 * @tags pattern
 */
export const EnvironmentVariables = {
  render: () => html`
<nve-card container="flat">
  <nve-card-header>
    <div nve-layout="row gap:sm align:wrap align:space-between full:width">
      <h2 nve-text="heading sm">Robot environment</h2>
      <nve-badge container="flat">Simulation</nve-badge>
    </div>
  </nve-card-header>
  <nve-card-content>
    <div nve-layout="column gap:sm align:horizontal-stretch">
      <div nve-layout="row gap:sm align:bottom full:width">
        <div nve-layout="full:width">
          <nve-password>
            <label>ROBOT_ID</label>
            <input type="password" value="AMR-07" readonly required autocomplete="off" />
          </nve-password>
        </div>
        <nve-copy-button behavior-copy container="flat" value="AMR-07" aria-label="Copy ROBOT_ID"></nve-copy-button>
      </div>
      <div nve-layout="row gap:sm align:bottom full:width">
        <div nve-layout="full:width">
          <nve-password>
            <label>ROS_DOMAIN_ID</label>
            <input type="password" value="42" readonly autocomplete="off" />
          </nve-password>
        </div>
        <nve-copy-button behavior-copy container="flat" value="42" aria-label="Copy ROS_DOMAIN_ID"></nve-copy-button>
      </div>
      <div nve-layout="row gap:sm align:bottom full:width">
        <div nve-layout="full:width">
          <nve-password>
            <label>SIMULATION_SCENE</label>
            <input type="password" value="warehouse-aisle-3" readonly autocomplete="off" />
          </nve-password>
        </div>
        <nve-copy-button behavior-copy container="flat" value="warehouse-aisle-3" aria-label="Copy SIMULATION_SCENE"></nve-copy-button>
      </div>
    </div>
  </nve-card-content>
</nve-card>
  `
};
