import { html } from 'lit';
import '@internals/elements-api/detail/define.js';

export default {
  title: 'Internal/Elements API/Detail',
  component: 'nve-api-detail',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <nve-api-detail tag="nve-alert" type="property" value="status"></nve-api-detail>

    <nve-api-detail tag="nve-alert" type="event" value="close"></nve-api-detail>

    <nve-api-detail tag="nve-alert" type="slot" value=""></nve-api-detail>
  </div>
  `
};
