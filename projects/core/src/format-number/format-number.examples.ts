// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/format-number/define.js';

export default {
  title: 'Elements/FormatNumber',
  component: 'nve-format-number'
};

/**
 * @summary Basic decimal formatting with localized grouping separators. Use for inline counts and metrics.
 */
export const Default = {
  render: () => html`
  <nve-format-number>1234567.89</nve-format-number>
  `
};

/**
 * @summary Currency formatting for monetary values with locale-aware symbols and separators. Use for prices, budgets, and financial totals.
 */
export const Currency = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number format-style="currency" currency="USD">1234.56</nve-format-number>
  <nve-format-number format-style="currency" currency="EUR" currency-display="code">1234.56</nve-format-number>
  <nve-format-number format-style="currency" currency="JPY" currency-display="name">1234</nve-format-number>
</div>
  `
};

/**
 * @summary Percent formatting for ratios and completion values. Source values should already represent a fraction (such as 0.85 for 85 percent).
 */
export const Percent = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number format-style="percent">0.85</nve-format-number>
  <nve-format-number format-style="percent">0.126</nve-format-number>
</div>
  `
};

/**
 * @summary Unit formatting for measurements and quantities. Use for distances, storage sizes, or other numeric labels that need a localized unit suffix.
 */
export const Unit = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number format-style="unit" unit="kilometer">1234.56</nve-format-number>
  <nve-format-number format-style="unit" unit="byte" unit-display="long">2048</nve-format-number>
  <nve-format-number format-style="unit" unit="celsius" unit-display="narrow">22</nve-format-number>
</div>
  `
};

/**
 * @summary Notation presets for scientific, engineering, and compact display. Use compact notation in dashboards or cards where space matters.
 */
export const Notation = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number notation="compact" compact-display="short">1234567</nve-format-number>
  <nve-format-number notation="compact" compact-display="long">1234567</nve-format-number>
  <nve-format-number notation="scientific">1234567</nve-format-number>
  <nve-format-number notation="engineering">1234567</nve-format-number>
</div>
  `
};

/**
 * @summary Sign display options for controlling positive and negative indicators. Use 'always' for delta values or 'exceptZero' for change indicators.
 */
export const SignDisplay = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number sign-display="always">42</nve-format-number>
  <nve-format-number sign-display="always">-42</nve-format-number>
  <nve-format-number sign-display="exceptZero">0</nve-format-number>
  <nve-format-number sign-display="never">-42</nve-format-number>
</div>
  `
};

/**
 * @summary Fraction digit control for tuning decimal precision. Use to enforce fixed decimal places in financial or scientific contexts.
 */
export const FractionDigits = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number minimum-fraction-digits="4">1.5</nve-format-number>
  <nve-format-number maximum-fraction-digits="0">1.567</nve-format-number>
  <nve-format-number minimum-fraction-digits="2" maximum-fraction-digits="2">3</nve-format-number>
</div>
  `
};

/**
 * @summary Explicit locale settings for internationalized number output. Use when the target audience locale differs from the document language or browser default.
 */
export const Locale = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-number locale="de-DE" format-style="currency" currency="EUR">1234.56</nve-format-number>
  <nve-format-number locale="ja-JP" format-style="currency" currency="JPY">1234</nve-format-number>
  <nve-format-number locale="fr-FR">1234567.89</nve-format-number>
</div>
  `
};

/**
 * @summary Number attribute input for values supplied by JavaScript or bound data. By default, the component formats text content, which also serves as the SSR fallback, and `number` wins when both are present.
 */
export const NumberAttribute = {
  render: () => html`
  <nve-format-number number="1234.56" format-style="currency" currency="USD"></nve-format-number>
  `
};