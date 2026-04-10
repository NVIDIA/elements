// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/sparkline/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/range/define.js';

export default {
  title: 'Elements/Sparkline',
  component: 'nve-sparkline',
};

/**
 * @summary Basic sparkline from numeric array values. Use as a compact trend indicator.
 */
export const Default = {
  render: () => html`
    <nve-sparkline id="default"></nve-sparkline>
    <script type="module">
      const sparkline = document.querySelector('nve-sparkline#default');
      sparkline.data = [18, 22, 20, 24, 19, 28, 25, 30];
    </script>
  `
};

/**
 * @summary Mark variants include line, area, gradient, column, and winloss to support trend and outcome signals.
 */
export const Marks = {
  render: () => html`
    <div nve-layout="row gap:md">
      <nve-sparkline data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
      <nve-sparkline mark="area" data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
      <nve-sparkline mark="gradient" data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
      <nve-sparkline mark="column" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline mark="winloss" data="[5, -3, 2, -1, 4, 0, 3]"></nve-sparkline>
    </div>
  `
};

/**
 * @summary Semantic statuses apply task, support, and trend color mappings.
 */
export const Status = {
  render: () => html`
    <div nve-layout="row gap:md">
      <nve-sparkline status="accent" mark="area" data="[3, 2, 10, 8, 4, 6, 9]"></nve-sparkline>
      <nve-sparkline status="danger" mark="area" data="[15, 14, 12, 9, 8, 7, 5]"></nve-sparkline>
      <nve-sparkline status="warning" mark="area" data="[8, 9, 7, 10, 9, 8, 9]"></nve-sparkline>
      <nve-sparkline status="success" mark="area" data="[5, 7, 8, 9, 12, 14, 15]"></nve-sparkline>
    </div>
  `
};

/**
 * @summary Sparklines inherit font size and flow inline with surrounding text and metrics.
 */
export const InlineWithText = {
  render: () => html`
    <div nve-layout="column gap:lg">
      <p nve-text="body loose">
        This week's lane keeping safety score trend 
        <nve-sparkline
          mark="area"
          status="success"
          data="[86, 87, 86, 88, 89, 90, 92, 93]"
          aria-label="lane keeping safety score trend"></nve-sparkline>
        shows a steady rise after an early dip, with decreasing interventions per shift: 
        <nve-sparkline
          mark="column"
          status="accent"
          data="[16, 14, 15, 13, 12, 11, 10]"
          aria-label="lane keeping interventions per shift"></nve-sparkline>, 
        and predominantly successful route outcomes: 
        <nve-sparkline
          mark="winloss"
          status="success"
          data="[1, 1, -1, 1, 0, 1, 1]"
          aria-label="lane keeping route outcomes"></nve-sparkline>.
      </p>
    </div>
  `
};

/**
 * @summary Embed sparklines in grid cells to add compact trend context to tabular data.
 */
export const DataGrid = {
  render: () => html`
    <nve-grid>
      <nve-grid-header>
        <nve-grid-column>Autonomy Service</nve-grid-column>
        <nve-grid-column>Safety Score</nve-grid-column>
        <nve-grid-column>Interventions / Shift</nve-grid-column>
        <nve-grid-column>Route Outcome</nve-grid-column>
      </nve-grid-header>
      <nve-grid-row>
        <nve-grid-cell>Lane Keeping</nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Lane Keeping 30 day safety score trend"
            mark="area"
            status="success"
            min="0"
            max="100"
            data="[86, 87, 86, 88, 89, 90, 92, 93]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Lane Keeping interventions per shift"
            mark="column"
            status="success"
            min="0"
            max="50"
            data="[12, 11, 12, 10, 9, 8, 7, 6]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Lane Keeping route outcomes"
            mark="winloss"
            data="[1, 1, 1, 0, 1, 0, 1, 1]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>Object Detection</nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Object Detection 30 day safety score trend"
            mark="area"
            status="warning"
            min="0"
            max="100"
            data="[76, 88, 72, 79, 85, 70, 83, 74]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Object Detection interventions per shift"
            mark="column"
            status="warning"
            min="0"
            max="50"
            data="[18, 20, 17, 19, 20, 21, 19, 22]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Object Detection route outcomes"
            mark="winloss"
            data="[1, 0, -1, 1, 0, -1, 0, 1]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>Path Planning</nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Path Planning 30 day safety score trend"
            mark="area"
            status="danger"
            min="0"
            max="100"
            data="[58, 54, 49, 45, 40, 36, 31, 27]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Path Planning interventions per shift"
            mark="column"
            status="danger"
            min="0"
            max="50"
            data="[24, 26, 29, 31, 34, 36, 39, 42]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-sparkline
            aria-label="Path Planning route outcomes"
            mark="winloss"
            data="[1, -1, 0, -1, -1, -1, 0, -1]"
            size="md"></nve-sparkline>
        </nve-grid-cell>
      </nve-grid-row>
    </nve-grid>
  `
};

/**
 * @summary Explicit size tokens set fixed sparkline height independent of text context.
 */
export const ExplicitSize = {
  render: () => html`
    <div id="sparkline-sizes" nve-layout="row gap:md">
      <nve-sparkline size="xs"></nve-sparkline>
      <nve-sparkline size="sm"></nve-sparkline>
      <nve-sparkline size="md"></nve-sparkline>
      <nve-sparkline size="lg"></nve-sparkline>
      <nve-sparkline size="xl"></nve-sparkline>
    </div>
    <script type="module">
      const sparklines = document.querySelectorAll('#sparkline-sizes > nve-sparkline');
      for (const sparkline of sparklines) {
        sparkline.data = [9, 12, 11, 13, 15, 14, 16];
      }
    </script>
  `
};

/**
 * @summary Without a size attribute, height scales with the parent text size for typographic alignment.
 */
export const DefaultSize = {
  render: () => html`
    <div id="inline-sparkline-sizes" nve-layout="column gap:md">
      <div nve-layout="row gap:sm" nve-text="heading">
        <span>heading</span>
        <nve-sparkline></nve-sparkline>
      </div>
      <div nve-layout="row gap:sm" nve-text="body">
        <span>body</span>
        <nve-sparkline></nve-sparkline>
      </div>
      <div nve-layout="row gap:sm" nve-text="label sm">
        <span>label sm</span>
        <nve-sparkline></nve-sparkline>
      </div>
    </div>
    <script type="module">
      const sparklines = document.querySelectorAll('#inline-sparkline-sizes > div[nve-text] > nve-sparkline');
      for (const sparkline of sparklines) {
        sparkline.data = [9, 12, 11, 13, 15, 14, 16];
      }
    </script>
  `
};

/**
 * @summary Interpolation controls linear, smooth, or step transitions between points.
 */
export const Interpolation = {
  render: () => html`
    <div id="sparkline-interpolations" nve-layout="row gap:md">
      <nve-sparkline mark="area" interpolation="linear"></nve-sparkline>
      <nve-sparkline mark="area" interpolation="smooth"></nve-sparkline>
      <nve-sparkline mark="area" interpolation="step"></nve-sparkline>
    </div>
    <script type="module">
      const sparklines = document.querySelectorAll('#sparkline-interpolations > nve-sparkline');
      for (const sparkline of sparklines) {
        sparkline.data = [6, 10, 8, 16, 13, 18, 15];
      }
    </script>
  `
};

/**
 * @summary Symbols denote specific data points in line, area, and gradient marks.
 */
export const Symbols = {
  render: () => html`
    <div id="sparkline-symbols" nve-layout="row gap:md">
      <nve-sparkline denote-last></nve-sparkline>
      <nve-sparkline denote-first denote-last></nve-sparkline>
      <nve-sparkline denote-min denote-max></nve-sparkline>
    </div>
    <script type="module">
      const sparklines = document.querySelectorAll('#sparkline-symbols > nve-sparkline');
      for (const sparkline of sparklines) {
        sparkline.data = [12, 8, 15, 10, 18, 14, 11];
      }
    </script>
  `
};

/**
 * @summary Fixed min and max values define a shared vertical domain to ensure comparability across adjacent sparklines.
 */
export const FixedDataDomain = {
  render: () => html`
    <div nve-layout="column gap:md align:left" nve-text="body lg">
      <nve-sparkline min="0" max="100" mark="area" status="accent" data="[80, 85, 90, 95, 100]"></nve-sparkline>
      <nve-sparkline min="0" max="100" mark="area" status="accent" data="[40, 45, 50, 55, 60]"></nve-sparkline>
      <nve-sparkline min="0" max="100" mark="area" status="accent" data="[0, 5, 10, 15, 20]"></nve-sparkline>
    </div>
  `
};

/**
 * @summary The chart renders a zero baseline when the data includes both positive and negative values.
 */
export const ZeroLine = {
  render: () => html`
    <div nve-layout="row gap:md">
      <nve-sparkline aria-label="mixed values" mark="area" data="[-3, 2, 5, -1, 3, -2, 4]"></nve-sparkline>
      <nve-sparkline aria-label="mostly negative values" mark="gradient" data="[-8, -5, -2, 1, -3, -6, -4]"></nve-sparkline>
      <nve-sparkline aria-label="mixed values column" mark="column" data="[-3, 2, 5, -1, 3, -2, 4]"></nve-sparkline>
    </div>
  `
};

/**
 * @summary Interval length adjusts spacing between points for line marks, from compact to spacious.
 */
export const IntervalLength = {
  render: () => html`
    <div id="sparkline-intervals" nve-layout="row gap:md">
      <nve-sparkline interval-length="0.3"></nve-sparkline>
      <nve-sparkline interval-length="0.6"></nve-sparkline>
      <nve-sparkline interval-length="2.0"></nve-sparkline>
    </div>
    <script type="module">
      const sparklines = document.querySelectorAll('#sparkline-intervals > nve-sparkline');
      for (const sparkline of sparklines) {
        sparkline.data = [10, 20, 15, 25, 18];
      }
    </script>
  `
};

/**
 * @summary CSS custom properties are available to adjust dimensions and visual styling.
 */
export const CustomStyling = {
  render: () => html`
    <nve-sparkline
      aria-label="custom sparkline"
      mark="gradient"
      interpolation="smooth"
      data="[8, 14, 9, 17, 13, 21, 16]"
      denote-last
      style="
        --height: 120px;
        --accent-color: var(--nve-sys-layer-canvas-background);
        --accent-radius: 5px;
        --accent-border-width: 3px;
        --line-width: 2.5px;
        --line-color: var(--nve-ref-color-blue-cobalt-1100);
        --gradient-max-color: color-mix(in oklab, var(--nve-ref-color-blue-cobalt-1100) 45%, transparent);
        --gradient-min-color: color-mix(in oklab, var(--nve-ref-color-blue-cobalt-1100), transparent 90%);
      "
    ></nve-sparkline>
  `
};
