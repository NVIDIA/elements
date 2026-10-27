// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/format-number/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/progress-bar/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/toggletip/define.js';
import '@nvidia-elements/core/tooltip/define.js';

export default {
  title: 'Patterns/Agent',
  component: 'nve-patterns'
};

/**
 * @summary Inline citation with a source preview, excerpts, and controls for browsing related references. Use beside claims in assistant responses so users can inspect evidence and open original sources without interrupting the reading flow.
 * @tags pattern
 */
export const Citation = {
  render() {
    return html`
<div nve-layout="row gap:xs align:vertical-center align:wrap">
  <p nve-text="body sm">For the AMR-07 aisle 3 review, pair Isaac Sim robot simulation with the Nav2 navigation framework.</p>
  <nve-tag id="agent-citation-trigger" size="sm" popovertarget="agent-citation" popovertargetaction="show" color="gray-denim" aria-label="View two sources for the navigation review">
    <nve-icon slot="prefix" name="book"></nve-icon> GitHub
  </nve-tag>
</div>
<nve-toggletip id="agent-citation" anchor="agent-citation-trigger" position="left" alignment="center" closable style="--width: min(320px, 90vw); --min-width: 0">
  <nve-toggletip-header>
    <h2 nve-text="heading sm">Sources</h2>
  </nve-toggletip-header>
  <article nve-layout="column gap:sm" aria-label="Isaac Sim source">
    <h3 nve-text="body sm semibold"><a nve-text="link sm" href="https://github.com/isaac-sim/IsaacSim">Isaac Sim</a></h3>
    <p nve-text="body sm muted">github.com · NVIDIA</p>
    <p nve-text="body sm">A robotics simulation platform for developing and testing robots in virtual environments.</p>
    <blockquote nve-layout="column gap:xs" nve-text="body sm muted" cite="https://github.com/isaac-sim/IsaacSim">
      “It supports importing robotic systems from common formats such as URDF, MJCF, and CAD.”
    </blockquote>
  </article>
</nve-toggletip>
    `;
  }
};

/**
 * @summary Expandable task progress with status labels and related files. Use for assistant workflows so users can inspect completed work, the current action, and remaining checks.
 * @tags pattern
 */
export const Task = {
  render: () => html`
<nve-accordion container="flat" behavior-expand>
  <nve-accordion-header>
    <nve-icon slot="prefix" name="checklist"></nve-icon>
    <h2 nve-text="body muted sm">Review AMR-07 navigation</h2>
    <nve-badge slot="suffix" status="running" container="flat">2 / 4</nve-badge>
  </nve-accordion-header>
  <nve-accordion-content>
    <div nve-layout="column gap:sm">
      <nve-grid container="flat" aria-label="Robot diagnostic tasks">
        <nve-grid-header>
          <nve-grid-column>Task</nve-grid-column>
          <nve-grid-column column-align="end">Status</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>
            <div nve-layout="column gap:xs full:width align:horizontal-stretch">
              <span nve-text="body sm">Inspect lidar timestamps</span>
              <span nve-text="body sm muted truncate" title="perception/lidar.py">perception/lidar.py</span>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge container="flat" status="finished">Complete</nve-badge>
          </nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>
            <div nve-layout="column gap:xs full:width align:horizontal-stretch">
              <span nve-text="body sm">Review local map updates</span>
              <span nve-text="body sm muted truncate" title="config/navigation.yaml">config/navigation.yaml</span>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge container="flat" status="finished">Complete</nve-badge>
          </nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>
            <div nve-layout="column gap:xs full:width align:horizontal-stretch">
              <span nve-text="body sm">Replay the aisle 3 route</span>
              <span nve-text="body sm muted truncate" title="tests/test_navigation.py">tests/test_navigation.py</span>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge container="flat" status="running">Running</nve-badge>
          </nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>
            <div nve-layout="column gap:xs full:width align:horizontal-stretch">
              <span nve-text="body sm">Summarize the replay</span>
              <span nve-text="body sm muted truncate" title="AMR-07 · simulation report">AMR-07 · simulation report</span>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge container="flat" status="queued">Pending</nve-badge>
          </nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    </div>
  </nve-accordion-content>
</nve-accordion>
  `
};

/**
 * @summary Collapsible citations with descriptive links to supporting documentation. Use alongside assistant responses to let users verify references without interrupting the conversation.
 * @tags pattern
 */
export const Sources = {
  render: () => html`
<nve-accordion container="flat" behavior-expand>
  <nve-accordion-header>
    <nve-icon slot="prefix" name="book"></nve-icon>
    <h2 nve-text="body muted sm">Navigation references</h2>
    <nve-badge slot="suffix" container="flat">3 sources</nve-badge>
  </nve-accordion-header>
  <nve-accordion-content>
    <nve-grid container="flat" aria-label="Robotics response sources">
      <nve-grid-header>
        <nve-grid-column>Source</nve-grid-column>
        <nve-grid-column>Publisher / topic</nve-grid-column>
      </nve-grid-header>
      <nve-grid-row>
        <nve-grid-cell>
          <a nve-text="link sm" href="https://github.com/isaac-sim/IsaacSim">Isaac Sim</a>
        </nve-grid-cell>
        <nve-grid-cell>
          <span nve-text="body sm muted">NVIDIA · Robot simulation</span>
        </nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>
          <a nve-text="link sm" href="https://github.com/ros-navigation/navigation2">Nav2</a>
        </nve-grid-cell>
        <nve-grid-cell>
          <span nve-text="body sm muted">ROS 2 · Robot navigation</span>
        </nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>
          <a nve-text="link sm" href="https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam">Isaac ROS Visual SLAM</a>
        </nve-grid-cell>
        <nve-grid-cell>
          <span nve-text="body sm muted">NVIDIA · Visual localization</span>
        </nve-grid-cell>
      </nve-grid-row>
    </nve-grid>
  </nve-accordion-content>
</nve-accordion>
  `
};

/**
 * @summary Static reasoning summary inside a collapsible disclosure with an elapsed time label. Use after an assistant finishes a response to explain its approach without streaming or a typewriter animation.
 * @tags pattern
 */
export const Reasoning = {
  render: () => html`
<nve-accordion container="flat" behavior-expand>
  <nve-accordion-header>
    <nve-icon slot="prefix" name="lightbulb"></nve-icon>
    <h2 nve-text="body muted sm">Route review · <nve-format-number format-style="unit" unit="second" unit-display="narrow">8</nve-format-number></h2>
    <nve-badge slot="suffix" status="finished" container="flat">Complete</nve-badge>
  </nve-accordion-header>
  <nve-accordion-content>
    <div nve-layout="column gap:sm">
      <p nve-text="body sm">AMR-07 pauses near aisle 3 when a lidar scan arrives after the local map update. The mission log shows a timestamp mismatch at the same waypoint. Replay the recorded sensor data in simulation and compare timestamps before changing navigation settings.</p>
      <span nve-text="body sm muted">Scope: aisle 3 replay · AMR-07</span>
    </div>
  </nve-accordion-content>
</nve-accordion>
  `
};

/**
 * @summary Expandable request queue with a queued count and file context for each request. Use while an assistant works to keep upcoming requests visible.
 * @tags pattern
 */
export const Queue = {
  render: () => html`
<div nve-layout="column gap:sm align:horizontal-stretch">
  <nve-accordion container="flat" behavior-expand>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="inbox"></nve-icon>
      <h2 nve-text="body muted sm">Request queue</h2>
      <nve-badge slot="suffix" status="queued" container="flat">3 queued</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <nve-grid container="flat" aria-label="Queued robot analysis requests">
        <nve-grid-header>
          <nve-grid-column>Request</nve-grid-column>
          <nve-grid-column>Context</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell><span nve-text="body sm">Compare AMR-07 sensor health</span></nve-grid-cell>
          <nve-grid-cell><nve-tag readonly><nve-icon slot="prefix" name="document"></nve-icon>mission.log</nve-tag></nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell><span nve-text="body sm">Review the aisle 3 route</span></nve-grid-cell>
          <nve-grid-cell><nve-tag readonly><nve-icon slot="prefix" name="document"></nve-icon>route.yaml</nve-tag></nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell><span nve-text="body sm">Summarize the docking replay</span></nve-grid-cell>
          <nve-grid-cell><nve-tag readonly><nve-icon slot="prefix" name="document"></nve-icon>dock.log</nve-tag></nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    </nve-accordion-content>
  </nve-accordion>
</div>
  `
};

/**
 * @summary Agent workflow combining task progress, supporting sources, queued requests, and a reasoning summary. Use to keep the current work and its context together while an assistant reviews navigation behavior.
 * @tags pattern
 */
export const Workflows = {
  render: () => html`
<nve-accordion-group container="flat" behavior-expand>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="checklist"></nve-icon>
      <h2 nve-text="body muted sm">Review AMR-07 navigation</h2>
      <nve-badge slot="suffix" status="running" container="flat">2 / 4</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm">
        <nve-grid container="flat" aria-label="Robot diagnostic tasks">
          <nve-grid-header>
            <nve-grid-column>Task</nve-grid-column>
            <nve-grid-column column-align="end">Status</nve-grid-column>
          </nve-grid-header>
          <nve-grid-row>
            <nve-grid-cell>
              <div nve-layout="column gap:xs full:width align:horizontal-stretch">
                <span nve-text="body sm">Inspect lidar timestamps</span>
                <span nve-text="body sm muted truncate" title="perception/lidar.py">perception/lidar.py</span>
              </div>
            </nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" status="finished">Complete</nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell>
              <div nve-layout="column gap:xs full:width align:horizontal-stretch">
                <span nve-text="body sm">Review local map updates</span>
                <span nve-text="body sm muted truncate" title="config/navigation.yaml">config/navigation.yaml</span>
              </div>
            </nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" status="finished">Complete</nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell>
              <div nve-layout="column gap:xs full:width align:horizontal-stretch">
                <span nve-text="body sm">Replay the aisle 3 route</span>
                <span nve-text="body sm muted truncate" title="tests/test_navigation.py">tests/test_navigation.py</span>
              </div>
            </nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" status="running">Running</nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell>
              <div nve-layout="column gap:xs full:width align:horizontal-stretch">
                <span nve-text="body sm">Summarize the replay</span>
                <span nve-text="body sm muted truncate" title="AMR-07 · simulation report">AMR-07 · simulation report</span>
              </div>
            </nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" status="queued">Pending</nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
        </nve-grid>
      </div>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="book"></nve-icon>
      <h2 nve-text="body muted sm">Navigation references</h2>
      <nve-badge slot="suffix" container="flat">3 sources</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <nve-grid container="flat" aria-label="Robotics response sources">
        <nve-grid-header>
          <nve-grid-column>Source</nve-grid-column>
          <nve-grid-column>Publisher / topic</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>
            <a nve-text="link sm" href="https://github.com/isaac-sim/IsaacSim">Isaac Sim</a>
          </nve-grid-cell>
          <nve-grid-cell>
            <span nve-text="body sm muted">NVIDIA · Robot simulation</span>
          </nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>
            <a nve-text="link sm" href="https://github.com/ros-navigation/navigation2">Nav2</a>
          </nve-grid-cell>
          <nve-grid-cell>
            <span nve-text="body sm muted">ROS 2 · Robot navigation</span>
          </nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>
            <a nve-text="link sm" href="https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam">Isaac ROS Visual SLAM</a>
          </nve-grid-cell>
          <nve-grid-cell>
            <span nve-text="body sm muted">NVIDIA · Visual localization</span>
          </nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="inbox"></nve-icon>
      <h2 nve-text="body muted sm">Request queue</h2>
      <nve-badge slot="suffix" status="queued" container="flat">3 queued</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <nve-grid container="flat" aria-label="Queued robot analysis requests">
        <nve-grid-header>
          <nve-grid-column>Request</nve-grid-column>
          <nve-grid-column>Context</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell><span nve-text="body sm">Compare AMR-07 sensor health</span></nve-grid-cell>
          <nve-grid-cell><nve-tag readonly><nve-icon slot="prefix" name="document"></nve-icon>mission.log</nve-tag></nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell><span nve-text="body sm">Review the aisle 3 route</span></nve-grid-cell>
          <nve-grid-cell><nve-tag readonly><nve-icon slot="prefix" name="document"></nve-icon>route.yaml</nve-tag></nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell><span nve-text="body sm">Summarize the docking replay</span></nve-grid-cell>
          <nve-grid-cell><nve-tag readonly><nve-icon slot="prefix" name="document"></nve-icon>dock.log</nve-tag></nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="lightbulb"></nve-icon>
      <h2 nve-text="body muted sm">Route review · <nve-format-number format-style="unit" unit="second" unit-display="narrow">8</nve-format-number></h2>
      <nve-badge slot="suffix" status="finished" container="flat">Complete</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm">
        <p nve-text="body sm">AMR-07 pauses near aisle 3 when a lidar scan arrives after the local map update. The mission log shows a timestamp mismatch at the same waypoint. Replay the recorded sensor data in simulation and compare timestamps before changing navigation settings.</p>
        <span nve-text="body sm muted">Scope: aisle 3 replay · AMR-07</span>
      </div>
    </nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};

/**
 * @summary Prompt composer with context tags in the textarea prefix and attachment, search, model, and submit controls in its suffix. Use for assistant input to keep message context and actions together.
 * @tags pattern
 */
export const PromptInput = {
  render() {
    return html`
<form id="agent-prompt" nve-layout="column gap:xs" aria-label="Message robotics assistant">
  <nve-textarea>
    <textarea name="message" aria-label="Message robotics assistant" rows="3" maxlength="4000" placeholder="Ask about AMR-07 navigation or sensor health"></textarea>
    <nve-tag slot="prefix" color="gray-denim" closable><nve-icon slot="prefix" name="document"></nve-icon>mission.log</nve-tag>
    <nve-tag slot="prefix" color="gray-denim" closable><nve-icon slot="prefix" name="document"></nve-icon>robot.yaml</nve-tag>
    <div slot="suffix" nve-layout="row gap:xs align:wrap align:vertical-center align:space-between full:width">
      <div nve-layout="row gap:xs align:wrap align:vertical-center">
        <nve-icon-button id="agent-attach" type="button" size="sm" icon-name="paper-clip" container="flat" aria-label="Attach robot logs"></nve-icon-button>
        <input id="agent-files" type="file" name="attachments" aria-label="Robot log attachments" multiple hidden />
        <nve-checkbox>
          <label>Search</label>
          <input type="checkbox" name="search" checked />
        </nve-checkbox>
        <nve-select container="flat" fit-content>
          <select name="model" aria-label="Assistant model">
            <option value="nemotron">Nemotron</option>
            <option value="llama">Llama</option>
          </select>
        </nve-select>
      </div>
      <nve-icon-button type="submit" icon-name="paper-airplane" aria-label="Send request"></nve-icon-button>
    </div>
  </nve-textarea>
  <output id="agent-attachments" nve-text="body sm muted" aria-live="polite" hidden></output>
  <output id="agent-submission" nve-text="body sm" aria-live="polite" hidden></output>
</form>
<script type="module">
  const form = document.querySelector('#agent-prompt');
  const files = form.querySelector('#agent-files');
  const attachments = form.querySelector('#agent-attachments');
  const submission = form.querySelector('#agent-submission');
  form.querySelector('#agent-attach').addEventListener('click', () => files.click());
  files.addEventListener('change', () => {
    attachments.textContent = Array.from(files.files, file => file.name).join(', ');
    attachments.hidden = !files.files.length;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = form.querySelector('textarea').value.trim();
    if (!message) return;
    submission.textContent = 'Request preview: ' + message;
    submission.hidden = false;
  });
</script>
    `;
  }
};

/**
 * @summary Context usage disclosure with a progress bar, token breakdown, and illustrative request cost. Use beside a composer to help users understand the available context window and inspect consumption details.
 * @tags pattern
 */
export const Context = {
  render: () => html`
<nve-button id="agent-context-trigger" size="sm" popovertarget="agent-context" container="flat">
  <nve-progress-ring size="xs" status="neutral" value="40000" max="128000" aria-hidden="true"></nve-progress-ring> Context Usage · 31.3%
</nve-button>
<nve-toggletip id="agent-context" anchor="agent-context-trigger" closable position="left" alignment="center" style="--min-width: 280px">
  <nve-toggletip-header>
    <p nve-text="body medium">Context Usage · 31.3%</p>
  </nve-toggletip-header>
  <div nve-layout="column gap:sm">
    <nve-progress-bar value="40000" max="128000" aria-label="Robot mission context usage"></nve-progress-bar>
    <dl nve-layout="grid span-items:6 gap:md">
      <dt nve-text="body muted medium">Input</dt>
      <dd nve-text="body"><nve-format-number>24000</nve-format-number></dd>
      <dt nve-text="body muted medium">Output</dt>
      <dd nve-text="body"><nve-format-number>8000</nve-format-number></dd>
      <dt nve-text="body muted medium">Reasoning</dt>
      <dd nve-text="body"><nve-format-number>4000</nve-format-number></dd>
      <dt nve-text="body muted medium">Cache Hit Rate</dt>
      <dd nve-text="body"><nve-format-number format-style="percent">0.95</nve-format-number></dd>
    </dl>
    <p nve-text="body sm"><nve-format-number notation="compact">40000</nve-format-number> / <nve-format-number notation="compact">128000</nve-format-number> tokens used</p>
  </div>
</nve-toggletip>
  `
};

/**
 * @summary Collapsible activity trace with completed, active, and pending stages plus supporting source links. Use for research assistants to show search progress and evidence behind a response.
 * @tags pattern
 */
export const ChainOfThought = {
  render: () => html`
<nve-accordion container="flat" behavior-expand expanded>
  <nve-accordion-header>
    <nve-icon slot="prefix" name="lightbulb"></nve-icon>
    <h2 nve-text="body muted sm">Navigation investigation</h2>
    <nve-badge slot="suffix" status="running" container="flat">Running</nve-badge>
  </nve-accordion-header>
  <nve-accordion-content>
    <div nve-layout="column gap:sm">
      <span nve-text="body sm muted">AMR-07 · Aisle 3 simulation replay</span>
      <nve-steps vertical aria-label="Robot investigation stages">
        <nve-steps-item status="success" readonly>Inspect mission logs</nve-steps-item>
        <nve-steps-item status="success" readonly>Compare sensor timestamps</nve-steps-item>
        <nve-steps-item status="pending" current="step" readonly>Replay the route</nve-steps-item>
        <nve-steps-item readonly>Prepare the findings</nve-steps-item>
      </nve-steps>
      <div nve-layout="column gap:xs">
        <p nve-text="body sm">The lidar and local map timestamps differ at waypoint 12. The simulation replay checks whether the mismatch recurs.</p>
        <div nve-layout="row gap:sm align:wrap">
          <a nve-text="link sm" href="https://github.com/isaac-sim/IsaacSim">Isaac Sim</a>
          <a nve-text="link sm" href="https://github.com/ros-navigation/navigation2">Nav2</a>
        </div>
      </div>
    </div>
  </nve-accordion-content>
</nve-accordion>
  `
};

/**
 * @summary Collapsible tool invocations with execution and approval status, formatted inputs, results, and errors. Use in assistant conversations to show what a tool received and returned while keeping operational details out of the main response.
 * @tags pattern
 */
export const Tools = {
  render: () => html`
<nve-accordion-group container="flat" behavior-expand aria-label="Robot assistant tool calls">
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="wrench"></nve-icon>
      <h2 nve-text="body muted sm">Apply calibration</h2>
      <nve-badge slot="suffix" container="flat" status="pending">Awaiting approval</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm align:horizontal-stretch">
        <h3 nve-text="body sm semibold">Parameters</h3>
        <nve-codeblock language="json">
<template>
{
  "robot_id": "AMR-07",
  "sensor": "lidar",
  "profile": "warehouse"
}
</template>
        </nve-codeblock>
        <h3 nve-text="body sm semibold">Approval</h3>
        <nve-alert status="warning"><p nve-text="body sm">Operator approval is required before applying the calibration.</p></nve-alert>
      </div>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="wrench"></nve-icon>
      <h2 nve-text="body muted sm">Replay navigation</h2>
      <nve-badge slot="suffix" container="flat" status="running">Running</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm align:horizontal-stretch">
        <h3 nve-text="body sm semibold">Parameters</h3>
        <nve-codeblock language="json">
<template>
{
  "robot_id": "AMR-07",
  "route": "aisle-3",
  "mode": "simulation"
}
</template>
        </nve-codeblock>
        <p nve-text="body sm muted">The simulation replay is checking obstacle avoidance.</p>
      </div>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="wrench"></nve-icon>
      <h2 nve-text="body muted sm">Read robot state</h2>
      <nve-badge slot="suffix" container="flat" status="finished">Complete</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm align:horizontal-stretch">
        <h3 nve-text="body sm semibold">Parameters</h3>
        <nve-codeblock language="json">
<template>
{
  "robot_id": "AMR-07"
}
</template>
        </nve-codeblock>
        <h3 nve-text="body sm semibold">Result</h3>
        <nve-codeblock language="json">
<template>
{
  "robot_id": "AMR-07",
  "battery_percent": 84,
  "lidar": "healthy",
  "mode": "idle"
}
</template>
        </nve-codeblock>
      </div>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="wrench"></nve-icon>
      <h2 nve-text="body muted sm">Fetch mission logs</h2>
      <nve-badge slot="suffix" container="flat" status="failed">Error</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm align:horizontal-stretch">
        <h3 nve-text="body sm semibold">Parameters</h3>
        <nve-codeblock language="json">
<template>
{
  "robot_id": "AMR-07",
  "mission_id": "aisle-3"
}
</template>
        </nve-codeblock>
        <h3 nve-text="body sm semibold">Error</h3>
        <nve-alert status="danger"><p nve-text="body sm">The log service timed out. No mission logs were returned.</p></nve-alert>
      </div>
    </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <nve-icon slot="prefix" name="wrench"></nve-icon>
      <h2 nve-text="body muted sm">Restart robot</h2>
      <nve-badge slot="suffix" container="flat" status="ignored">Denied</nve-badge>
    </nve-accordion-header>
    <nve-accordion-content>
      <div nve-layout="column gap:sm align:horizontal-stretch">
        <h3 nve-text="body sm semibold">Parameters</h3>
        <nve-codeblock language="json">
<template>
{
  "robot_id": "AMR-07",
  "reason": "sensor recovery"
}
</template>
        </nve-codeblock>
        <p nve-text="body sm muted">The operator denied the restart. The tool did not run.</p>
      </div>
    </nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};

/**
 * @summary Model settings with streaming and reasoning controls, sampling parameters, and token limits. Use synchronized sliders and numeric inputs with contextual help to configure model responses.
 * @tags pattern
 */
export const ModelSettings = {
  render() {
    return html`
<form id="robot-model-settings" aria-label="Model response settings" nve-layout="column gap:lg" style="max-width: 380px">
  <p nve-text="body sm muted">Configure response generation, sampling parameters, and token limits.</p>
  <div nve-layout="grid span-items:6 gap:md align:space-between full:width">
    <nve-switch>
      <label>Stream Responses</label>
      <input type="checkbox" name="stream" checked />
      <nve-icon-button slot="label" type="button" icon-name="information-circle" size="sm" container="flat" interestfor="robot-stream-help" aria-label="About streaming responses"></nve-icon-button>
    </nve-switch>
    <nve-switch>
      <label>Reasoning</label>
      <input type="checkbox" name="reasoning" checked />
      <nve-icon-button slot="label" type="button" icon-name="information-circle" size="sm" container="flat" interestfor="robot-reasoning-help" aria-label="About reasoning"></nve-icon-button>
    </nve-switch>
  </div>
  <div data-sampling-setting nve-layout="row gap:md align:vertical-center full:width">
    <nve-range>
      <label>Temperature</label>
      <nve-icon-button slot="label" type="button" icon-name="information-circle" size="sm" container="flat" interestfor="robot-temperature-help" aria-label="About temperature"></nve-icon-button>
      <input type="range" name="temperature" min="0" max="2" step="0.05" value="0.5" />
      <datalist>
        <option value="0">0</option>
        <option value="0.5">0.5</option>
        <option value="1">1</option>
        <option value="1.5">1.5</option>
        <option value="2">2</option>
      </datalist>
    </nve-range>
    <nve-input style="--width: 96px">
      <input type="number" min="0" max="2" step="0.05" value="0.5" aria-label="Temperature value" required />
    </nve-input>
  </div>
  <div data-sampling-setting nve-layout="row gap:md align:vertical-center full:width">
    <nve-range>
      <label>Top P</label>
      <nve-icon-button slot="label" type="button" icon-name="information-circle" size="sm" container="flat" interestfor="robot-top-p-help" aria-label="About Top P"></nve-icon-button>
      <input type="range" name="top_p" min="0.05" max="1" step="0.05" value="0.9" />
      <datalist>
        <option value="0.05">0.05</option>
        <option value="0.25">0.25</option>
        <option value="0.5">0.5</option>
        <option value="0.75">0.75</option>
        <option value="1">1</option>
      </datalist>
    </nve-range>
    <nve-input style="--width: 96px">
      <input type="number" min="0.05" max="1" step="0.05" value="0.9" aria-label="Top P value" required />
    </nve-input>
  </div>
  <div data-sampling-setting nve-layout="row gap:md align:vertical-center full:width">
    <nve-range>
      <label>Max Tokens</label>
      <nve-icon-button slot="label" type="button" icon-name="information-circle" size="sm" container="flat" interestfor="robot-max-tokens-help" aria-label="About max tokens"></nve-icon-button>
      <input type="range" name="max_tokens" min="256" max="65536" step="256" value="61440" />
      <datalist>
        <option value="256">256</option>
        <option value="16384">16k</option>
        <option value="32768">32k</option>
        <option value="49152">48k</option>
        <option value="65536">64k</option>
      </datalist>
    </nve-range>
    <nve-input style="--width: 96px">
      <input type="number" min="256" max="65536" step="256" value="61440" aria-label="Max tokens value" required />
    </nve-input>
  </div>
  <nve-input>
    <label>Context Limit</label>
    <nve-icon-button slot="label" type="button" icon-name="information-circle" size="sm" container="flat" interestfor="robot-context-limit-help" aria-label="About context limit"></nve-icon-button>
    <input type="number" name="context_limit" min="1024" max="262144" step="1024" value="131072" required />
  </nve-input>
</form>
<nve-tooltip id="robot-stream-help" position="bottom" style="--width: 240px">
  Show mission summaries as text arrives instead of waiting for the complete response.
</nve-tooltip>
<nve-tooltip id="robot-reasoning-help" position="bottom" style="--width: 240px">
  Enable the model's reasoning mode for mission analysis and simulation reviews. Availability depends on the selected model.
</nve-tooltip>
<nve-tooltip id="robot-temperature-help" position="bottom" style="--width: 240px">
  Controls variation in generated mission summaries. Lower values favor more consistent wording when comparing simulation runs.
</nve-tooltip>
<nve-tooltip id="robot-top-p-help" position="bottom" style="--width: 240px">
  Limits token sampling by cumulative probability. Use to adjust the variety of explanations in a robot or vehicle scenario review.
</nve-tooltip>
<nve-tooltip id="robot-max-tokens-help" position="bottom" style="--width: 240px">
  Caps the generated response length, including mission analysis and suggested next checks. The available limit depends on the model.
</nve-tooltip>
<nve-tooltip id="robot-context-limit-help" position="bottom" style="--width: 240px">
  Total token budget for mission logs, retrieved references, conversation, and the generated response. Keep this within the selected model's supported context window.
</nve-tooltip>
<script type="module">
  const settings = document.querySelector('#robot-model-settings');
  settings.addEventListener('submit', event => event.preventDefault());
  settings.querySelectorAll('[data-sampling-setting]').forEach(group => {
    const range = group.querySelector('input[type="range"]');
    const number = group.querySelector('input[type="number"]');
    range.addEventListener('input', () => {
      number.value = range.value;
    });
    number.addEventListener('input', () => {
      if (number.validity.valid) range.value = number.value;
    });
  });
</script>
    `;
  }
};
