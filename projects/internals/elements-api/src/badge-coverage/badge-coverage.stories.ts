import { html } from 'lit';
import '@nve-internals/elements-api/badge-coverage/define.js';

export default {
  title: 'Internal/Elements API/Badge Coverage',
  component: 'nve-api-badge-coverage',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <div nve-layout="column gap:md">
      <nve-api-badge-coverage value="90" container="flat"></nve-api-badge-coverage>
      <nve-api-badge-coverage value="70" container="flat"></nve-api-badge-coverage>
      <nve-api-badge-coverage value="60" container="flat"></nve-api-badge-coverage>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-coverage value="90" container="flat">coverage: </nve-api-badge-coverage>
      <nve-api-badge-coverage value="70" container="flat">coverage: </nve-api-badge-coverage>
      <nve-api-badge-coverage value="60" container="flat">coverage: </nve-api-badge-coverage>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-coverage value="90"></nve-api-badge-coverage>
      <nve-api-badge-coverage value="70"></nve-api-badge-coverage>
      <nve-api-badge-coverage value="60"></nve-api-badge-coverage>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-coverage value="90">coverage: </nve-api-badge-coverage>
      <nve-api-badge-coverage value="70">coverage: </nve-api-badge-coverage>
      <nve-api-badge-coverage value="60">coverage: </nve-api-badge-coverage>
    </div>
  </div>
  `
};
