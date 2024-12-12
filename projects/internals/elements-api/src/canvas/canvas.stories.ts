import { html } from 'lit';
import '@internals/elements-api/canvas/define.js';

export default {
  title: 'Internal/Elements API/Canvas',
  component: 'nve-api-canvas',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <nve-api-canvas>
      <nve-button>button</nve-button>
    </nve-api-canvas>

    <nve-api-canvas .source=${'<nve-button>button</nve-button>'}>
      <nve-button>button</nve-button>
    </nve-api-canvas>

    <nve-api-canvas .source=${'<NveButton>button</NveButton>'}>
      <nve-button>button</nve-button>
    </nve-api-canvas>
  </div>
  `
};
