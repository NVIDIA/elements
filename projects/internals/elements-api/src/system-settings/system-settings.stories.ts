import { html } from 'lit';
import '@nve-internals/elements-api/system-settings/define.js';
import '@nvidia-elements/core/card/define.js';

export default {
  title: 'Internal/Elements API/System Settings',
  component: 'nve-api-system-settings',
};

export const Default = {
  render: () => html`
    <nve-api-system-settings></nve-api-system-settings>
  `
};
