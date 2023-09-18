import { html } from 'lit';
import '@elements/elements/progress-bar/define.js';

export default {
  title: 'Elements/Progress Bar/Examples',
  component: 'nve-progress-bar',
};

export const Default = {
  render: () => html`
    <div nve-layout="column gap:md pad:lg">
      <nve-progress-bar status="danger"></nve-progress-bar>

      <nve-progress-bar status="accent" value="25"></nve-progress-bar>

      <nve-progress-bar status="success" value="50"></nve-progress-bar>

      <nve-progress-bar status="warning" value="75"></nve-progress-bar>

      <nve-progress-bar status="danger" value="100"></nve-progress-bar>
  </div>
  `
};