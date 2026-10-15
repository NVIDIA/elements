// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/progress-dot/define.js';

export default {
  title: 'Elements/Progress Dot',
  component: 'nve-progress-dot'
};

/**
 * @summary Indeterminate dots communicate ongoing work when a completion percentage is unavailable.
 */
export const Default = {
  render: () => html`<nve-progress-dot aria-label="Loading results"></nve-progress-dot>`
};

/**
 * @summary Three indicator sizes fit loading feedback into compact rows or spacious panels.
 */
export const Size = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-progress-dot size="sm" aria-label="Loading results"></nve-progress-dot>
      <nve-progress-dot size="md" aria-label="Loading results"></nve-progress-dot>
      <nve-progress-dot size="lg" aria-label="Loading results"></nve-progress-dot>
    </div>
  `
};

/**
 * @summary An adjacent label describes the pending task and supplies the indicator's accessible name.
 */
export const WithText = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <span id="progress-dot-label" nve-text="body sm muted">Thinking</span><nve-progress-dot size="sm" aria-labelledby="progress-dot-label"></nve-progress-dot>
    </div>
  `
};

/**
 * @summary Button indicators inherit text color to keep loading feedback visible across button treatments.
 */
export const WithButton = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-button disabled aria-busy="true">
        <nve-progress-dot size="sm" aria-hidden="true"></nve-progress-dot>
        Saving…
      </nve-button>
      <nve-button interaction="emphasis" disabled aria-busy="true">
        <nve-progress-dot size="sm" aria-hidden="true"></nve-progress-dot>
        Saving…
      </nve-button>
    </div>
  `
};

/**
 * @summary Custom color, dimensions, and timing adapt loading feedback to its surrounding interface.
 * @tags theme
 */
export const CustomStyles = {
  render: () => html`
    <nve-progress-dot
      aria-label="Loading results"
      style="--color: var(--nve-sys-support-accent-color); --width: var(--nve-ref-size-1000); --height: var(--nve-ref-size-600); --animation-duration: 2s"
    ></nve-progress-dot>
  `
};

/**
 * @summary Static dots keep loading feedback visible when animation is unnecessary or distracting.
 * @tags test-case
 */
export const Static = {
  render: () => html`
    <nve-progress-dot aria-label="Loading results" style="--animation-duration: 0s"></nve-progress-dot>
  `
};
