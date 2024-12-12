import { html } from 'lit';
import '@nve-internals/elements-api/table/define.js';

export default {
  title: 'Internal/Elements API/Table',
  component: 'nve-api-table',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg pad:lg">
    <nve-api-table tag="nve-badge" type="properties"></nve-api-table>

    <nve-api-table tag="nve-badge" type="slots"></nve-api-table>

    <nve-api-table tag="nve-badge" type="events"></nve-api-table>

    <nve-api-table tag="nve-badge" type="css-properties"></nve-api-table>

    <nve-api-table tag="nve-badge"></nve-api-table>
  </div>
  `
};
