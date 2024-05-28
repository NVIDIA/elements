import { html } from 'lit';
import '@nvidia-elements/core/progress-bar/define.js';

export default {
  title: 'Elements/Progress Bar/Examples',
  component: 'mlv-progress-bar',
};

export const Default = {
  render: () => html`
    <div mlv-layout="column gap:md pad:lg full">
      <mlv-progress-bar value="0"></mlv-progress-bar>

      <mlv-progress-bar status="accent" value="25"></mlv-progress-bar>

      <mlv-progress-bar status="success" value="50"></mlv-progress-bar>

      <mlv-progress-bar status="warning" value="75"></mlv-progress-bar>

      <mlv-progress-bar status="danger" value="100"></mlv-progress-bar>
    </div>
  `
};

export const Max = {
  render: () => html`
    <div mlv-layout="column gap:md pad:lg full">
      <mlv-progress-bar status="accent" value="25" max="50"></mlv-progress-bar>

      <mlv-progress-bar status="accent" value="45" max="50"></mlv-progress-bar>
    </div>
  `
};

export const Labeled = {
  render: () => html`
    <div mlv-layout="column gap:xxxs pad:lg align:horizontal-stretch grow">
      <div mlv-layout="row align:space-between">
        <p mlv-text="label sm">Upload Status</p>
        <p mlv-text="label emphasis sm">80%</p>
      </div>

      <mlv-progress-bar status="accent" value="80"></mlv-progress-bar>
    </div>
  `
};

export const Indeterminate = {
  render: () => html`
    <div mlv-layout="column gap:md pad:lg full">
      <mlv-progress-bar></mlv-progress-bar>
    </div>
  `
};