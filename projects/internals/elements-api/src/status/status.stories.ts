import { html } from 'lit';
import '@nve-internals/elements-api/status/define.js';

export default {
  title: 'Internal/Elements API/Status',
  component: 'nve-api-status',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <nve-api-status tag="nve-badge"></nve-api-status>
  </div>
  `
};
