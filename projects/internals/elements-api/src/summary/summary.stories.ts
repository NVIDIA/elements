import { html } from 'lit';
import '@nve-internals/elements-api/summary/define.js';

export default {
  title: 'Internal/Elements API/Summary',
  component: 'nve-api-summary',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <nve-api-summary tag="nve-badge"></nve-api-summary>
  </div>
  `
};
