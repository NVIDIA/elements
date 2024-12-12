import { html } from 'lit';
import '@nve-internals/elements-api/badge-bundle/define.js';

export default {
  title: 'Internal/Elements API/Badge Bundle',
  component: 'nve-api-badge-bundle',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <div nve-layout="column gap:md">
      <nve-api-badge-bundle value="10" container="flat"></nve-api-badge-bundle>
      <nve-api-badge-bundle value="40" container="flat"></nve-api-badge-bundle>
      <nve-api-badge-bundle value="50" container="flat"></nve-api-badge-bundle>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-bundle value="10" container="flat">bundle: </nve-api-badge-bundle>
      <nve-api-badge-bundle value="40" container="flat">bundle: </nve-api-badge-bundle>
      <nve-api-badge-bundle value="50" container="flat">bundle: </nve-api-badge-bundle>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-bundle value="10"></nve-api-badge-bundle>
      <nve-api-badge-bundle value="40"></nve-api-badge-bundle>
      <nve-api-badge-bundle value="50"></nve-api-badge-bundle>
    </div>
    <div nve-layout="column gap:md">
      <nve-api-badge-bundle value="10">bundle: </nve-api-badge-bundle>
      <nve-api-badge-bundle value="40">bundle: </nve-api-badge-bundle>
      <nve-api-badge-bundle value="50">bundle: </nve-api-badge-bundle>
    </div>
  </div>
  `
};
