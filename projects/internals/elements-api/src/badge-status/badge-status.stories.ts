import { html } from 'lit';
import '@nve-internals/elements-api/badge-status/define.js';

export default {
  title: 'Internal/Elements API/Badge Status',
  component: 'nve-api-badge-status',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <div nve-layout="column gap:md">
      <nve-api-badge-status value="pre-release"></nve-api-badge-status>
      <nve-api-badge-status value="beta"></nve-api-badge-status>
      <nve-api-badge-status value="stable"></nve-api-badge-status>
      <nve-api-badge-status></nve-api-badge-status>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-status container="flat" value="pre-release"></nve-api-badge-status>
      <nve-api-badge-status container="flat" value="beta"></nve-api-badge-status>
      <nve-api-badge-status container="flat" value="stable"></nve-api-badge-status>
      <nve-api-badge-status container="flat"></nve-api-badge-status>
    </div>
  </div>
  `
};
