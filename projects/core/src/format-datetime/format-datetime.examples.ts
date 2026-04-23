// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/format-datetime/define.js';

export default {
  title: 'Elements/FormatDatetime',
  component: 'nve-format-datetime',
};

/**
 * @summary Basic date formatting with the long date style preset. Use for displaying human-readable dates in content areas, tables, or metadata.
 */
export const Default = {
  render: () => html`
  <nve-format-datetime date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
  `
};

/**
 * @summary Date style presets for controlling output density. Use full or long for detail-rich contexts and medium or short for compact layouts like data tables or cards.
 */
export const DateStyle = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime date-style="full">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime date-style="medium">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime date-style="short">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};

/**
 * @summary Combined date and time style presets for full timestamps. Use for audit logs, event schedules, or activity feeds that need both date and time.
 * Preset styles take precedence over granular formatting options when both appear.
 */
export const TimeStyle = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime date-style="long" time-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime date-style="short" time-style="short">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};

/**
 * @summary Granular date part options for precise formatting control. Use when presets don't match your layout, such as weekday and month only. Do not combine with date-style or time-style; style presets take priority if both appear.
 */
export const Granular = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime weekday="long" month="short" day="numeric" year="numeric">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime month="long" year="numeric">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};

/**
 * @summary Time-only formatting with granular hour, minute, and second options. Use for clocks, time labels, or timestamps where the date is unnecessary.
 */
export const TimeOnly = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime hour="numeric" minute="2-digit">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime hour="2-digit" minute="2-digit" second="2-digit">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};

/**
 * @summary Explicit locale settings for internationalized date output. Use when the target audience locale differs from the browser default, such as multilingual dashboards or region-specific reports.
 */
export const Locale = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime locale="de-DE" date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime locale="ja" date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime locale="fr-FR" date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};

/**
 * @summary Date attribute input for values supplied by JavaScript or bound data. By default, the component formats text content, which also serves as the SSR fallback, and `date` wins when both are present.
 */
export const DateAttribute = {
  render: () => html`
  <nve-format-datetime date="2023-07-28T04:20:17.434Z" date-style="long"></nve-format-datetime>
  `
};

/**
 * @summary Time zone conversion for displaying dates in a specific region. Use for global teams, scheduling interfaces, or when UTC or server timestamps need a fixed time zone.
 */
export const TimeZone = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime date-style="long" time-style="long" time-zone="America/New_York">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime date-style="long" time-style="long" time-zone="Asia/Tokyo">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};

/**
 * @summary Time zone name labels in short and long form alongside the formatted date. Use with granular options when the viewer needs to know which time zone applies, such as meeting schedulers or cross-region dashboards.
 */
export const TimeZoneName = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-datetime locale="en-US" month="long" day="numeric" year="numeric" hour="numeric" minute="2-digit" time-zone="America/New_York" time-zone-name="short">2023-07-28T04:20:17.434Z</nve-format-datetime>
  <nve-format-datetime locale="en-US" month="long" day="numeric" year="numeric" hour="numeric" minute="2-digit" time-zone="America/New_York" time-zone-name="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
</div>
  `
};
