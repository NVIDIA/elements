// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/scroll-box/define.js';

export default {
  title: 'Elements/Scroll Box',
  component: 'nve-scroll-box'
};

/** @summary Both-axis scrolling keeps large content reachable within a constrained area. Use for wide diagrams or detailed content in a panel. */
export const Default = {
  render: () => html`
    <nve-scroll-box role="region" aria-label="Activity" style="width: 20rem; height: 12rem;">
      <div nve-layout="column gap:md pad:md" style="width: 40rem; height: 24rem;">
        <p nve-text="body">Training activity and resource allocation</p>
        <p nve-text="body">Review training jobs across the cluster and inspect resource allocation for each workload.</p>
        <p nve-text="body">The panel keeps its size while the application supplies the content and its layout.</p>
        <p nve-text="body">Scroll in either direction to explore the full activity report and reach the content beyond the viewport.</p>
      </div>
    </nve-scroll-box>
  `
};

/** @summary Vertical scrolling keeps long activity lists within a fixed-height panel. Use edge shadows to indicate additional content above or below the viewport. */
export const Vertical = {
  render: () => html`
    <nve-scroll-box orientation="vertical" scroll-shadow role="region" aria-label="Training activity" style="block-size: 12rem;">
      <div nve-layout="column gap:md pad:md">
        ${Array.from({ length: 12 }, (_, index) => html`<p nve-text="body">Training job ${index + 1}</p>`)}
      </div>
    </nve-scroll-box>
  `
};

/** @summary Horizontal scrolling keeps wide content accessible on narrow screens. Arrange children in a light DOM layout and enable edge shadows for overflow cues. */
export const Horizontal = {
  render: () => html`
    <nve-scroll-box orientation="horizontal" scroll-shadow role="region" aria-label="Training stages">
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
 * @tags theme
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
