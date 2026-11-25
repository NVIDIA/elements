// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/foundations/draggable-list/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/drag-handle/define.js';

export default { title: 'Elements/Draggable List', component: 'nve-draggable-list' };

/**
 * @summary Reorder task rows through labeled drag handles with native dragging, keyboard pickup, or click placement. The application applies each requested placement and retains control of order.
 */
export const Default = {
  render: () => html`
    <nve-draggable-list id="task-order" style="max-width: 200px">
      <div nve-layout="row gap:sm align:vertical-center"><nve-drag-handle aria-label="Move prepare data"></nve-drag-handle><span nve-text="body">Prepare data</span></div>
      <div nve-layout="row gap:sm align:vertical-center"><nve-drag-handle aria-label="Move train model"></nve-drag-handle><span nve-text="body">Train model</span></div>
      <div nve-layout="row gap:sm align:vertical-center"><nve-drag-handle aria-label="Move evaluate model"></nve-drag-handle><span nve-text="body">Evaluate model</span></div>
    </nve-draggable-list>
    <script type="module">
      import '@nvidia-elements/core/drag-handle/define.js';
      import '@nvidia-elements/foundations/draggable-list/define.js';
      document.querySelector('#task-order').addEventListener('draggable-drop', event => {
        const { source, target, placement } = event.detail;
        target.insertAdjacentElement(placement === 'after' ? 'afterend' : 'beforebegin', source);
      });
    </script>
  `
};

/**
 * @summary A horizontal pipeline follows the reading direction for pointer placement and arrow keys. Use for ordered stages that the application can rearrange.
 */
export const Horizontal = {
  render: () => html`
    <nve-draggable-list id="pipeline-order" orientation="horizontal">
      <div nve-layout="row gap:sm align:vertical-center pad:sm"><nve-drag-handle aria-label="Move prepare stage"></nve-drag-handle><span nve-text="body">Prepare</span></div>
      <div nve-layout="row gap:sm align:vertical-center pad:sm"><nve-drag-handle aria-label="Move train stage"></nve-drag-handle><span nve-text="body">Train</span></div>
      <div nve-layout="row gap:sm align:vertical-center pad:sm"><nve-drag-handle aria-label="Move evaluate stage"></nve-drag-handle><span nve-text="body">Evaluate</span></div>
    </nve-draggable-list>
    <script type="module">
      import '@nvidia-elements/core/drag-handle/define.js';
      import '@nvidia-elements/foundations/draggable-list/define.js';
      document.querySelector('#pipeline-order').addEventListener('draggable-drop', event => {
        const { source, target, placement } = event.detail;
        target.insertAdjacentElement(placement === 'after' ? 'afterend' : 'beforebegin', source);
      });
    </script>
  `
};

/**
 * @summary Transfer jobs between queue cards through one drop listener on a shared ancestor. Drop on the background of either list to append a job, even when the queue is empty.
 */
export const Connected = {
  render: () => html`
    <section id="job-queues" nve-layout="grid gap:md span-items:6 align:vertical-stretch" style="max-width: 480px">
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Pending</h3>
        </nve-card-header>
        <nve-card-content>
          <nve-draggable-list nve-draggable="dropzone" role="group" aria-label="Move to pending" tabindex="0" style="min-height: 150px;">
            <div nve-layout="row gap:sm align:vertical-center"><nve-drag-handle aria-label="Move training job"></nve-drag-handle><span nve-text="body">Training</span></div>
            <div nve-layout="row gap:sm align:vertical-center"><nve-drag-handle aria-label="Move evaluation job"></nve-drag-handle><span nve-text="body">Evaluation</span></div>
          </nve-draggable-list>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Scheduled</h3>
        </nve-card-header>
        <nve-card-content>
          <nve-draggable-list nve-draggable="dropzone" role="group" aria-label="Move to scheduled" tabindex="0" style="min-height: 150px;"></nve-draggable-list>
        </nve-card-content>
      </nve-card>
    </section>
    <script type="module">
      import '@nvidia-elements/core/card/define.js';
      import '@nvidia-elements/core/drag-handle/define.js';
      import '@nvidia-elements/foundations/draggable-list/define.js';
      document.querySelector('#job-queues').addEventListener('draggable-drop', event => {
        const { source, target, targetContainer, placement } = event.detail;
        if (target === targetContainer) targetContainer.append(source);
        else target.insertAdjacentElement(placement === 'after' ? 'afterend' : 'beforebegin', source);
      });
    </script>
  `
};
