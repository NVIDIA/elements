import { html } from 'lit';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/alert/define.js';

export default {
  title: 'Elements/Badge',
  component: 'nve-badge',
};

/**
 * @description Basic badge component with default styling. Use for simple non-interactive labels or status indicators.
 */
export const Default = {
  render: () => html`
  <nve-badge>badge</nve-badge>
  `
};

/**
 * @description Badges with predefined status colors for different states. Ideal for showing job status, task progress, or system states.
 */
export const Status = {
  render: () => html`
<div nve-layout="row gap:xs align:wrap">
  <nve-badge status="scheduled">scheduled</nve-badge>
  <nve-badge status="queued">queued</nve-badge>
  <nve-badge status="pending">pending</nve-badge>
  <nve-badge status="starting">starting</nve-badge>
  <nve-badge status="running">running</nve-badge>
  <nve-badge status="restarting">restarting</nve-badge>
  <nve-badge status="stopping">stopping</nve-badge>
  <nve-badge status="finished">finished</nve-badge>
  <nve-badge status="failed">failed</nve-badge>
  <nve-badge status="unknown">unknown</nve-badge>
  <nve-badge status="ignored">ignored</nve-badge>
</div>
  `
}

/**
 * @description Flat container badges with status colors for a more subtle appearance. Perfect for dense layouts or when you want less visual weight.
 */
export const StatusFlat = {
  render: () => html`
<div nve-layout="row gap:md align:wrap">
  <nve-badge container="flat" status="scheduled">scheduled</nve-badge>
  <nve-badge container="flat" status="queued">queued</nve-badge>
  <nve-badge container="flat" status="pending">pending</nve-badge>
  <nve-badge container="flat" status="starting">starting</nve-badge>
  <nve-badge container="flat" status="running">running</nve-badge>
  <nve-badge container="flat" status="restarting">restarting</nve-badge>
  <nve-badge container="flat" status="stopping">stopping</nve-badge>
  <nve-badge container="flat" status="finished">finished</nve-badge>
  <nve-badge container="flat" status="failed">failed</nve-badge>
  <nve-badge container="flat" status="unknown">unknown</nve-badge>
  <nve-badge container="flat" status="ignored">ignored</nve-badge>
</div>
  `
}

/**
 * @description Status badges with icons only, using aria-label for accessibility. Useful for compact status indicators in toolbars or data tables.
 */
export const StatusIcon = {
  render: () => html`
<div nve-layout="row gap:md align:wrap">
  <nve-badge container="flat" status="scheduled" aria-label="scheduled"></nve-badge>
  <nve-badge container="flat" status="queued" aria-label="queued"></nve-badge>
  <nve-badge container="flat" status="pending" aria-label="pending"></nve-badge>
  <nve-badge container="flat" status="starting" aria-label="starting"></nve-badge>
  <nve-badge container="flat" status="running" aria-label="running"></nve-badge>
  <nve-badge container="flat" status="restarting" aria-label="restarting"></nve-badge>
  <nve-badge container="flat" status="stopping" aria-label="stopping"></nve-badge>
  <nve-badge container="flat" status="finished" aria-label="finished"></nve-badge>
  <nve-badge container="flat" status="failed" aria-label="failed"></nve-badge>
  <nve-badge container="flat" status="unknown" aria-label="unknown"></nve-badge>
  <nve-badge container="flat" status="ignored" aria-label="ignored"></nve-badge>
</div>
  `
}

/**
 * @description Support status badges for general feedback states. Use for success, warning, error, or informational messages.
 */
export const Support = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge status="accent">accent</nve-badge>
  <nve-badge status="warning">warning</nve-badge>
  <nve-badge status="success">success</nve-badge>
  <nve-badge status="danger">danger</nve-badge>
</div>
  `
}

/**
 * @description Status badges in light theme for better visibility on light backgrounds. Use when your application primarily uses light mode.
 */
export const StatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md align:wrap">
  <nve-badge status="scheduled">scheduled</nve-badge>
  <nve-badge status="queued">queued</nve-badge>
  <nve-badge status="pending">pending</nve-badge>
  <nve-badge status="starting">starting</nve-badge>
  <nve-badge status="running">running</nve-badge>
  <nve-badge status="restarting">restarting</nve-badge>
  <nve-badge status="stopping">stopping</nve-badge>
  <nve-badge status="finished">finished</nve-badge>
  <nve-badge status="failed">failed</nve-badge>
  <nve-badge status="unknown">unknown</nve-badge>
  <nve-badge status="ignored">ignored</nve-badge>
</div>
  `
}

/**
 * @description Status badges in dark theme for better visibility on dark backgrounds. Use when your application primarily uses dark mode.
 */
export const StatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md align:wrap">
  <nve-badge status="scheduled">scheduled</nve-badge>
  <nve-badge status="queued">queued</nve-badge>
  <nve-badge status="pending">pending</nve-badge>
  <nve-badge status="starting">starting</nve-badge>
  <nve-badge status="running">running</nve-badge>
  <nve-badge status="restarting">restarting</nve-badge>
  <nve-badge status="stopping">stopping</nve-badge>
  <nve-badge status="finished">finished</nve-badge>
  <nve-badge status="failed">failed</nve-badge>
  <nve-badge status="unknown">unknown</nve-badge>
  <nve-badge status="ignored">ignored</nve-badge>
</div>
  `
}

/**
 * @description Trend badges for displaying data changes and metrics. Perfect for dashboards, analytics, or financial data showing positive, negative, or neutral trends.
 */
export const Trend = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge>0%</nve-badge>
  <nve-badge status="success">+15%</nve-badge>
  <nve-badge status="danger">-15%</nve-badge>
</div>
  `
}

/**
 * @description Badges with color variants for categorization and theming. Use for organizing content by color-coded categories.
 */
export const Color = {
  render: () => html`
<div nve-layout="row gap:sm align:wrap">
  <nve-badge color="red-cardinal"><nve-icon name="placeholder"></nve-icon> red-cardinal</nve-badge>
  <nve-badge color="gray-slate"><nve-icon name="placeholder"></nve-icon> gray-slate</nve-badge>
  <nve-badge color="gray-denim"><nve-icon name="placeholder"></nve-icon> gray-denim</nve-badge>
  <nve-badge color="blue-indigo"><nve-icon name="placeholder"></nve-icon> blue-indigo</nve-badge>
  <nve-badge color="blue-cobalt"><nve-icon name="placeholder"></nve-icon> blue-cobalt</nve-badge>
  <nve-badge color="blue-sky"><nve-icon name="placeholder"></nve-icon> blue-sky</nve-badge>
  <nve-badge color="teal-cyan"><nve-icon name="placeholder"></nve-icon> teal-cyan</nve-badge>
  <nve-badge color="green-mint"><nve-icon name="placeholder"></nve-icon> green-mint</nve-badge>
  <nve-badge color="teal-seafoam"><nve-icon name="placeholder"></nve-icon> teal-seafoam</nve-badge>
  <nve-badge color="green-grass"><nve-icon name="placeholder"></nve-icon> green-grass</nve-badge>
  <nve-badge color="yellow-amber"><nve-icon name="placeholder"></nve-icon> yellow-amber</nve-badge>
  <nve-badge color="orange-pumpkin"><nve-icon name="placeholder"></nve-icon> orange-pumpkin</nve-badge>
  <nve-badge color="red-tomato"><nve-icon name="placeholder"></nve-icon> red-tomato</nve-badge>
  <nve-badge color="pink-magenta"><nve-icon name="placeholder"></nve-icon> pink-magenta</nve-badge>
  <nve-badge color="purple-plum"><nve-icon name="placeholder"></nve-icon> purple-plum</nve-badge>
  <nve-badge color="purple-violet"><nve-icon name="placeholder"></nve-icon> purple-violet</nve-badge>
  <nve-badge color="purple-lavender"><nve-icon name="placeholder"></nve-icon> purple-lavender</nve-badge>
  <nve-badge color="pink-rose"><nve-icon name="placeholder"></nve-icon> pink-rose</nve-badge>
  <nve-badge color="green-jade"><nve-icon name="placeholder"></nve-icon> green-jade</nve-badge>
  <nve-badge color="lime-pear"><nve-icon name="placeholder"></nve-icon> lime-pear</nve-badge>
  <nve-badge color="yellow-nova"><nve-icon name="placeholder"></nve-icon> yellow-nova</nve-badge>
  <nve-badge color="brand-green"><nve-icon name="placeholder"></nve-icon> brand-green</nve-badge>
</div>
  `
};

/**
 * @description High emphasis badges with custom colors for important or highlighted content. Use for critical information, featured items, or primary actions.
 */
export const Prominence = {
  render: () => html`
<div nve-layout="row gap:sm align:wrap">
  <nve-badge prominence="emphasis" color="red-cardinal"><nve-icon name="placeholder"></nve-icon> red-cardinal</nve-badge>
  <nve-badge prominence="emphasis" color="gray-slate"><nve-icon name="placeholder"></nve-icon> gray-slate</nve-badge>
  <nve-badge prominence="emphasis" color="gray-denim"><nve-icon name="placeholder"></nve-icon> gray-denim</nve-badge>
  <nve-badge prominence="emphasis" color="blue-indigo"><nve-icon name="placeholder"></nve-icon> blue-indigo</nve-badge>
  <nve-badge prominence="emphasis" color="blue-cobalt"><nve-icon name="placeholder"></nve-icon> blue-cobalt</nve-badge>
  <nve-badge prominence="emphasis" color="blue-sky"><nve-icon name="placeholder"></nve-icon> blue-sky</nve-badge>
  <nve-badge prominence="emphasis" color="teal-cyan"><nve-icon name="placeholder"></nve-icon> teal-cyan</nve-badge>
  <nve-badge prominence="emphasis" color="green-mint"><nve-icon name="placeholder"></nve-icon> green-mint</nve-badge>
  <nve-badge prominence="emphasis" color="teal-seafoam"><nve-icon name="placeholder"></nve-icon> teal-seafoam</nve-badge>
  <nve-badge prominence="emphasis" color="green-grass"><nve-icon name="placeholder"></nve-icon> green-grass</nve-badge>
  <nve-badge prominence="emphasis" color="yellow-amber"><nve-icon name="placeholder"></nve-icon> yellow-amber</nve-badge>
  <nve-badge prominence="emphasis" color="orange-pumpkin"><nve-icon name="placeholder"></nve-icon> orange-pumpkin</nve-badge>
  <nve-badge prominence="emphasis" color="red-tomato"><nve-icon name="placeholder"></nve-icon> red-tomato</nve-badge>
  <nve-badge prominence="emphasis" color="pink-magenta"><nve-icon name="placeholder"></nve-icon> pink-magenta</nve-badge>
  <nve-badge prominence="emphasis" color="purple-plum"><nve-icon name="placeholder"></nve-icon> purple-plum</nve-badge>
  <nve-badge prominence="emphasis" color="purple-violet"><nve-icon name="placeholder"></nve-icon> purple-violet</nve-badge>
  <nve-badge prominence="emphasis" color="purple-lavender"><nve-icon name="placeholder"></nve-icon> purple-lavender</nve-badge>
  <nve-badge prominence="emphasis" color="pink-rose"><nve-icon name="placeholder"></nve-icon> pink-rose</nve-badge>
  <nve-badge prominence="emphasis" color="green-jade"><nve-icon name="placeholder"></nve-icon> green-jade</nve-badge>
  <nve-badge prominence="emphasis" color="lime-pear"><nve-icon name="placeholder"></nve-icon> lime-pear</nve-badge>
  <nve-badge prominence="emphasis" color="yellow-nova"><nve-icon name="placeholder"></nve-icon> yellow-nova</nve-badge>
  <nve-badge prominence="emphasis" color="brand-green"><nve-icon name="placeholder"></nve-icon> brand-green</nve-badge>
</div>
  `
};

/**
 * @description Flat container badges with custom colors for a minimal, borderless appearance. Ideal for subtle categorization or when you want to reduce visual noise.
 */
export const Flat = {
  render: () => html`
<div nve-layout="row gap:sm align:wrap">
  <nve-badge container="flat" color="red-cardinal"><nve-icon name="placeholder"></nve-icon> red-cardinal</nve-badge>
  <nve-badge container="flat" color="gray-slate"><nve-icon name="placeholder"></nve-icon> gray-slate</nve-badge>
  <nve-badge container="flat" color="gray-denim"><nve-icon name="placeholder"></nve-icon> gray-denim</nve-badge>
  <nve-badge container="flat" color="blue-indigo"><nve-icon name="placeholder"></nve-icon> blue-indigo</nve-badge>
  <nve-badge container="flat" color="blue-cobalt"><nve-icon name="placeholder"></nve-icon> blue-cobalt</nve-badge>
  <nve-badge container="flat" color="blue-sky"><nve-icon name="placeholder"></nve-icon> blue-sky</nve-badge>
  <nve-badge container="flat" color="teal-cyan"><nve-icon name="placeholder"></nve-icon> teal-cyan</nve-badge>
  <nve-badge container="flat" color="green-mint"><nve-icon name="placeholder"></nve-icon> green-mint</nve-badge>
  <nve-badge container="flat" color="teal-seafoam"><nve-icon name="placeholder"></nve-icon> teal-seafoam</nve-badge>
  <nve-badge container="flat" color="green-grass"><nve-icon name="placeholder"></nve-icon> green-grass</nve-badge>
  <nve-badge container="flat" color="yellow-amber"><nve-icon name="placeholder"></nve-icon> yellow-amber</nve-badge>
  <nve-badge container="flat" color="orange-pumpkin"><nve-icon name="placeholder"></nve-icon> orange-pumpkin</nve-badge>
  <nve-badge container="flat" color="red-tomato"><nve-icon name="placeholder"></nve-icon> red-tomato</nve-badge>
  <nve-badge container="flat" color="pink-magenta"><nve-icon name="placeholder"></nve-icon> pink-magenta</nve-badge>
  <nve-badge container="flat" color="purple-plum"><nve-icon name="placeholder"></nve-icon> purple-plum</nve-badge>
  <nve-badge container="flat" color="purple-violet"><nve-icon name="placeholder"></nve-icon> purple-violet</nve-badge>
  <nve-badge container="flat" color="purple-lavender"><nve-icon name="placeholder"></nve-icon> purple-lavender</nve-badge>
  <nve-badge container="flat" color="pink-rose"><nve-icon name="placeholder"></nve-icon> pink-rose</nve-badge>
  <nve-badge container="flat" color="green-jade"><nve-icon name="placeholder"></nve-icon> green-jade</nve-badge>
  <nve-badge container="flat" color="lime-pear"><nve-icon name="placeholder"></nve-icon> lime-pear</nve-badge>
  <nve-badge container="flat" color="yellow-nova"><nve-icon name="placeholder"></nve-icon> yellow-nova</nve-badge>
  <nve-badge container="flat" color="brand-green"><nve-icon name="placeholder"></nve-icon> brand-green</nve-badge>
</div>
  `
};

/**
 * @description Badge with constrained width to demonstrate text overflow behavior. Use when you need to control badge width in constrained layouts or responsive designs.
 */
export const Overflow = {
  render: () => html`
  <nve-badge status="pending" style="--width: 150px">some really long content</nve-badge>
  `
};
