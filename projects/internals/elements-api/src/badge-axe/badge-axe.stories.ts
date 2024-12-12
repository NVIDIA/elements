import { html } from 'lit';
import '@internals/elements-api/badge-axe/define.js';

export default {
  title: 'Internal/Elements API/Badge Axe',
  component: 'nve-api-badge-axe',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <div nve-layout="column gap:sm">
      <nve-api-badge-axe container="flat"></nve-api-badge-axe>
      <nve-api-badge-axe value="color-contrast" container="flat"></nve-api-badge-axe>
    </div>
    <div nve-layout="column gap:sm">
      <nve-api-badge-axe></nve-api-badge-axe>
      <nve-api-badge-axe value="color-contrast"></nve-api-badge-axe>
    </div>
  </div>
  `
};
