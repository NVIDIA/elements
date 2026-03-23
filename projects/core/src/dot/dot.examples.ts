import { html } from 'lit';
import '@nvidia-elements/core/dot/define.js';

export default {
  title: 'Elements/Dot',
  component: 'nve-dot',
};

/**
 * @summary Basic dot component with status indicator, providing a simple visual cue for process states and system status.
 */
export const Default = {
  render: () => html`
<nve-dot status="starting"></nve-dot>
  `
};

/**
 * @summary Different dot sizes to accommodate layout contexts from compact indicators to prominent status displays.
 * @tags test-case
 */
export const Size = {
  render: () => html`
<div nve-layout="row gap:sm">
  <nve-dot size="sm">10</nve-dot>
  <nve-dot>10</nve-dot>
  <nve-dot size="lg">10</nve-dot>
</div>
<br>
<div nve-layout="row gap:lg">
  <nve-dot size="sm"></nve-dot>
  <nve-dot></nve-dot>
  <nve-dot size="lg"></nve-dot>
</div>
  `
}

/**
 * @summary Semantic color variations for general status communication, enabling clear visual distinction of different states and priorities.
 */
export const SupportStatus = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot></nve-dot>
  <nve-dot status="accent"></nve-dot>
  <nve-dot status="warning"></nve-dot>
  <nve-dot status="success"></nve-dot>
  <nve-dot status="danger"></nve-dot>
</div>
  `
}

/**
 * @summary Dot with numeric content for notification badges and counters, providing clear visual indicators of quantity or alerts.
 */
export const Number = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot>10</nve-dot>
  <nve-dot status="accent" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="warning" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="success" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="danger" aria-label="10 notifications">10</nve-dot>
</div>
  `
}

/**
 * @summary Comprehensive process status indicators for system operations, providing clear visual feedback on job states and workflow progress.
 */
export const Status = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot status="scheduled"></nve-dot>
  <nve-dot status="queued"></nve-dot>
  <nve-dot status="pending"></nve-dot>
  <nve-dot status="starting"></nve-dot>
  <nve-dot status="running"></nve-dot>
  <nve-dot status="restarting"></nve-dot>
  <nve-dot status="stopping"></nve-dot>
  <nve-dot status="finished"></nve-dot>
  <nve-dot status="failed"></nve-dot>
  <nve-dot status="unknown"></nve-dot>
</div>
  `
}
