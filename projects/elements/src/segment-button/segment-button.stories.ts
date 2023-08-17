import { html } from 'lit';
import '@elements/elements/segment-button/define.js';

export default {
  title: 'Elements/Segment Button/Examples',
  component: 'nve-segment-button',
};

export const Default = {
  render: () => html`
<nve-segment-button behavior-select>
  <nve-button value="sessions" pressed>sessions</nve-button>
  <nve-button value="uploads">uploads</nve-button>
  <nve-button disabled value="settings">settings</nve-button>
</nve-segment-button>
  `
};

export const IconButtons = {
  render: () => html`
<nve-segment-button behavior-select>
  <nve-icon-button pressed value="vertical" aria-label="split vertical" icon-name="split-vertical"></nve-icon-button>
  <nve-icon-button value="horizontal" aria-label="split horizontal" icon-name="split-horizontal"></nve-icon-button>
  <nve-icon-button value="none" aria-label="split none" icon-name="split-none"></nve-icon-button>
</nve-segment-button>
  `
};