import { html } from 'lit';
import '@nvidia-elements/core/progress-bar/define.js';

export default {
  title: 'Elements/Progress Bar',
  component: 'nve-progress-bar',
};

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

export const Max = {
  render: () => html`
    <div nve-layout="column gap:md pad:lg full">
      <nve-progress-bar status="accent" value="25" max="50"></nve-progress-bar>

      <nve-progress-bar status="accent" value="45" max="50"></nve-progress-bar>
    </div>
  `
};

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

export const Indeterminate = {
  render: () => html`
    <nve-progress-bar></nve-progress-bar>
  `
};

export const IndeterminateStatusColors = {
  render: () => html`
    <div nve-layout="column gap:md full">
      <nve-progress-bar status="accent"></nve-progress-bar>

      <nve-progress-bar status="warning"></nve-progress-bar>

      <nve-progress-bar status="danger"></nve-progress-bar>
    </div>
  `
};

export const IndeterminateCustomColor = {
  render: () => html`
    <nve-progress-bar style="--accent-color: var(--nve-sys-accent-primary-background); --height: var(--nve-ref-size-150); --opacity: 1;"></nve-progress-bar>
  `
};
export const CustomHeights = {
  render: () => html`
    <div nve-layout="column gap:md full">
      <nve-progress-bar style="--height: var(--nve-ref-size-100);"></nve-progress-bar>

      <nve-progress-bar style="--height: var(--nve-ref-size-200);"></nve-progress-bar>

      <nve-progress-bar style="--height: var(--nve-ref-size-300);"></nve-progress-bar>
    </div>
  `
};
