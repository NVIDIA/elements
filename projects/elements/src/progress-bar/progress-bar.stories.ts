import { html } from 'lit';
import '@nvidia-elements/core/progress-bar/define.js';

export default {
  title: 'Elements/Progress Bar',
  component: 'nve-progress-bar',
};

/**
 * @summary Progress bars with different status colors showing completion levels from 0% to 100% for task tracking.
 */
export const Default = {
  render: () => html`
    <div nve-layout="column gap:md pad:lg full">
      <nve-progress-bar value="0"></nve-progress-bar>

      <nve-progress-bar status="accent" value="25"></nve-progress-bar>

      <nve-progress-bar status="success" value="50"></nve-progress-bar>

      <nve-progress-bar status="warning" value="75"></nve-progress-bar>

      <nve-progress-bar status="danger" value="100"></nve-progress-bar>
    </div>
  `
};

/**
 * @summary Progress bars with custom max values for representing non-percentage based progress like file counts or steps.
 */
export const Max = {
  render: () => html`
    <div nve-layout="column gap:md pad:lg full">
      <nve-progress-bar status="accent" value="25" max="50"></nve-progress-bar>

      <nve-progress-bar status="accent" value="45" max="50"></nve-progress-bar>
    </div>
  `
};

/**
 * @summary Progress bar with descriptive label and percentage display for clear communication of upload or task status.
 */
export const Labeled = {
  render: () => html`
    <div nve-layout="column gap:xxxs pad:lg align:horizontal-stretch grow">
      <div nve-layout="row align:space-between">
        <p nve-text="label sm">Upload Status</p>
        <p nve-text="label emphasis sm">80%</p>
      </div>

      <nve-progress-bar status="accent" value="80"></nve-progress-bar>
    </div>
  `
};

/**
 * @summary Indeterminate progress bar for showing activity when completion time is unknown, like loading or processing.
 */
export const Indeterminate = {
  render: () => html`
    <nve-progress-bar></nve-progress-bar>
  `
};

/**
 * @summary Indeterminate progress bars with status color variants for contextual loading states and severity levels.
 */
export const IndeterminateStatusColors = {
  render: () => html`
    <div nve-layout="column gap:md full">
      <nve-progress-bar status="accent"></nve-progress-bar>

      <nve-progress-bar status="warning"></nve-progress-bar>

      <nve-progress-bar status="danger"></nve-progress-bar>
    </div>
  `
};

/**
 * @summary Indeterminate progress bar with custom color, height, and opacity for brand-specific styling and visual emphasis.
 * @tags test-case
 */
export const IndeterminateCustomColor = {
  render: () => html`
    <nve-progress-bar style="--accent-color: var(--nve-sys-accent-primary-background); --height: var(--nve-ref-size-150); --opacity: 1;"></nve-progress-bar>
  `
};

/**
 * @summary Progress bars with custom heights for different visual prominence levels and layout requirements.
 * @tags test-case
 */
export const CustomHeights = {
  render: () => html`
    <div nve-layout="column gap:md full">
      <nve-progress-bar style="--height: var(--nve-ref-size-100);"></nve-progress-bar>

      <nve-progress-bar style="--height: var(--nve-ref-size-200);"></nve-progress-bar>

      <nve-progress-bar style="--height: var(--nve-ref-size-300);"></nve-progress-bar>
    </div>
  `
};
