import { html } from 'lit';
import '@nvidia-elements/core/format-relative-time/define.js';

export default {
  title: 'Elements/FormatRelativeTime',
  component: 'nve-format-relative-time',
};

/**
 * @summary Basic relative time formatting with auto unit selection. Use for displaying human-readable relative timestamps in content areas, feeds, or metadata.
 */
export const Default = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-relative-time>2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time>2024-06-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time>2025-12-01T12:00:00.000Z</nve-format-relative-time>
</div>
  `
};

/**
 * @summary Numeric formatting control for natural language output. Use 'auto' to display natural forms such as 'yesterday' instead of '1 day ago'.
 */
export const Numeric = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-relative-time numeric="always" unit="year">2025-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time numeric="auto" unit="year">2025-01-15T12:00:00.000Z</nve-format-relative-time>
</div>
  `
};

/**
 * @summary Format style presets for controlling output verbosity. Use 'short' or 'narrow' for compact layouts such as data tables or timelines.
 */
export const FormatStyle = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-relative-time format-style="long">2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time format-style="short">2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time format-style="narrow">2020-01-15T12:00:00.000Z</nve-format-relative-time>
</div>
  `
};

/**
 * @summary Explicit time unit selection for keeping relative time in a fixed unit. Use when you always want output in days, months, or years instead of letting the component auto-select the unit.
 */
export const Unit = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-relative-time unit="day">2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time unit="month">2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time unit="year">2020-01-15T12:00:00.000Z</nve-format-relative-time>
</div>
  `
};

/**
 * @summary Explicit locale settings for internationalized relative time output. Use when the target audience locale differs from the document language or browser default.
 */
export const Locale = {
  render: () => html`
<div nve-layout="column gap:sm">
  <nve-format-relative-time locale="de-DE">2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time locale="ja">2020-01-15T12:00:00.000Z</nve-format-relative-time>
  <nve-format-relative-time locale="fr-FR">2020-01-15T12:00:00.000Z</nve-format-relative-time>
</div>
  `
};

/**
 * @summary Date attribute input for values supplied by JavaScript or bound data. By default, the component formats text content, which also serves as the SSR fallback, and `date` wins when both are present.
 */
export const DateAttribute = {
  render: () => html`
  <nve-format-relative-time date="2020-01-15T12:00:00.000Z"></nve-format-relative-time>
  `
};

/**
 * @summary Auto-updating relative time with the sync attribute. Use for live feeds, notifications, or dashboards where freshness matters.
 */
export const Sync = {
  render: () => html`
  <nve-format-relative-time sync>2020-01-15T12:00:00.000Z</nve-format-relative-time>
  `
};
