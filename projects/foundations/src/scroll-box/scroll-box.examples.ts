// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/foundations/scroll-box/define.js';

export default {
  title: 'Elements/Scroll Box',
  component: 'nve-scroll-box'
};

/**
 * @summary Default scrolling behavior. Use for small content or when you expect the content to fit within the viewport.
 */
export const Default = {
  render: () => html`
    <nve-scroll-box aria-label="Activity" scroll-shadow style="height: 12rem;">
      <div nve-layout="column gap:md pad:md" style="height: 24rem;">
        <p nve-text="body">Training activity and resource allocation</p>
        <p nve-text="body">Review training jobs across the cluster and inspect resource allocation for each workload.</p>
        <p nve-text="body">The panel keeps its size while the application supplies the content and its layout.</p>
        <p nve-text="body">Scroll in either direction to explore the full activity report and reach the content beyond the viewport.</p>
      </div>
    </nve-scroll-box>
  `
};

/**
 * @summary Both-axis scrolling keeps large content reachable within a constrained area. Use for wide diagrams or detailed content in a panel.
 * @tags test-case
 */
export const Axes = {
  render: () => html`
    <nve-scroll-box aria-label="Activity" scroll-shadow style="width: 20rem; height: 12rem;">
      <div nve-layout="column gap:md pad:md" style="width: 40rem; height: 24rem;">
        <p nve-text="body">Training activity and resource allocation</p>
        <p nve-text="body">Review training jobs across the cluster and inspect resource allocation for each workload.</p>
        <p nve-text="body">The panel keeps its size while the application supplies the content and its layout.</p>
        <p nve-text="body">Scroll in either direction to explore the full activity report and reach the content beyond the viewport.</p>
      </div>
    </nve-scroll-box>
  `
};

/**
 * @summary Vertical scrolling keeps long activity lists within a fixed-height panel. Use edge shadows to indicate additional content above or below the viewport.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
    <nve-scroll-box orientation="vertical" scroll-shadow aria-label="Training activity" style="block-size: 12rem;">
      <div nve-layout="column gap:md pad:md">
        ${Array.from({ length: 12 }, (_, index) => html`<p nve-text="body">Training job ${index + 1}</p>`)}
      </div>
    </nve-scroll-box>
  `
};

/** @summary Automatic scrolling follows new messages while allowing readers to review earlier content. Use for chat responses or logs; return to the latest message to resume following. */
export const Follow = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-scroll-box id="follow-messages" orientation="vertical" auto-scroll="follow" scroll-shadow aria-label="Conversation" style="block-size: 12rem;">
        <div nve-layout="column gap:md pad:md">
          ${Array.from({ length: 12 }, (_, index) => html`<p nve-text="body">Conversation message ${index + 1}</p>`)}
        </div>
      </nve-scroll-box>
      <nve-button id="follow-add-message">Add message</nve-button>
    </div>
    <script type="module">
      const messages = document.querySelector('#follow-messages > div');
      document.querySelector('#follow-add-message').addEventListener('click', () => {
        const message = document.createElement('p');
        message.setAttribute('nve-text', 'body');
        message.textContent = 'Conversation message ' + (messages.childElementCount + 1);
        messages.append(message);
      });
    </script>
  `
};

/**
 * @summary Horizontal scrolling keeps wide content accessible on narrow screens. Arrange children in a light DOM layout and enable edge shadows for overflow cues.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
    <nve-scroll-box orientation="horizontal" scroll-shadow aria-label="Training stages">
      <div nve-layout="row gap:md pad:md" style="inline-size: max-content;">
        <p nve-text="body">Dataset preparation</p>
        <p nve-text="body">Data validation</p>
        <p nve-text="body">Data augmentation</p>
        <p nve-text="body">Model configuration</p>
        <p nve-text="body">Hyperparameter tuning</p>
        <p nve-text="body">Resource allocation</p>
        <p nve-text="body">Training execution</p>
        <p nve-text="body">Checkpoint validation</p>
        <p nve-text="body">Model evaluation</p>
        <p nve-text="body">Model optimization</p>
        <p nve-text="body">Deployment preparation</p>
        <p nve-text="body">Production monitoring</p>
      </div>
    </nve-scroll-box>
  `
};

/**
 * @summary Hidden scrollbars reduce visual weight while edge shadows indicate overflow. Use when an application provides another clear way to discover scrolling.
 * @tags test-case
 */
export const HiddenScrollbar = {
  render: () => html`
    <nve-scroll-box orientation="vertical" scroll-shadow role="region" aria-label="Training activity"
      style="block-size: 12rem; --scrollbar-width: none;">
      <div nve-layout="column gap:md pad:md">
        ${Array.from({ length: 12 }, (_, index) => html`<p nve-text="body">Training job ${index + 1}</p>`)}
      </div>
    </nve-scroll-box>
  `
};
