import { html } from 'lit';
import '@elements/elements/progress-bar/define.js';

export default {
  title: 'Elements/Progress Bar/Examples',
  component: 'mlv-progress-bar',
};

export const Default = {
  render: () => html`
    <div mlv-layout="column gap:md pad:lg">
      <mlv-progress-bar status="danger"></mlv-progress-bar>

      <mlv-progress-bar status="accent" value="25"></mlv-progress-bar>

      <mlv-progress-bar status="success" value="50"></mlv-progress-bar>

      <mlv-progress-bar status="warning" value="75"></mlv-progress-bar>

      <mlv-progress-bar status="danger" value="100"></mlv-progress-bar>
  </div>
  `
};