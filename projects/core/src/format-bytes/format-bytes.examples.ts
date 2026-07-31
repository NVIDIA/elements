// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/format-bytes/define.js';

export default {
  title: 'Elements/FormatBytes',
  component: 'nve-format-bytes'
};

/**
 * @summary Automatic decimal conversion for concise file sizes and storage metrics. The component selects the appropriate unit from the byte count.
 */
export const Default = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-format-bytes>1024</nve-format-bytes>
      <nve-format-bytes>1048576</nve-format-bytes>
      <nve-format-bytes>1073741824</nve-format-bytes>
    </div>
  `
};

/**
 * @summary Forced unit magnitudes for comparing byte counts on a consistent scale. Use when values need the same unit across a table or chart.
 */
export const Unit = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-format-bytes unit="kb">1048576</nve-format-bytes>
      <nve-format-bytes unit="mb">1048576</nve-format-bytes>
      <nve-format-bytes unit="gb">1048576</nve-format-bytes>
    </div>
  `
};

/**
 * @summary Short and long unit labels for compact metrics or explanatory text. Long labels improve clarity when space allows.
 */
export const UnitDisplay = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-format-bytes unit-display="short">1048576</nve-format-bytes>
      <nve-format-bytes unit-display="long">1048576</nve-format-bytes>
      <nve-format-bytes display="binary" unit-display="long">1048576</nve-format-bytes>
    </div>
  `
};

/**
 * @summary Fraction digit controls for matching the precision of storage measurements. Use fixed digits when values must align visually.
 */
export const Precision = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-format-bytes maximum-fraction-digits="0">1234567</nve-format-bytes>
      <nve-format-bytes maximum-fraction-digits="2">1234567</nve-format-bytes>
      <nve-format-bytes minimum-fraction-digits="3" maximum-fraction-digits="3">1234567</nve-format-bytes>
    </div>
  `
};

/**
 * @summary Explicit locale formatting for audiences whose numeric separators differ from the document language. Unit labels remain lowercase English.
 */
export const Locale = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-format-bytes locale="en-US">1048576</nve-format-bytes>
      <nve-format-bytes locale="de-DE">1048576</nve-format-bytes>
      <nve-format-bytes locale="fr-FR">1048576</nve-format-bytes>
    </div>
  `
};

/**
 * @summary Value attribute input for JavaScript or bound data. It takes precedence over text content while the text remains an SSR fallback.
 */
export const Value = {
  render: () => html`<nve-format-bytes value="1048576">1024</nve-format-bytes>`
};

/**
 * @summary Decimal and binary conversion for matching SI or IEC storage conventions. Use the convention expected by the surrounding product.
 */
export const Display = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-format-bytes display="decimal">1024</nve-format-bytes>
      <nve-format-bytes display="binary">1024</nve-format-bytes>
    </div>
  `
};
