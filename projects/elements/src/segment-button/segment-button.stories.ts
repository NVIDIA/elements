import { html } from 'lit';
import '@elements/elements/segment-button/define.js';

export default {
  title: 'Elements/Segment Button/Examples',
  component: 'mlv-segment-button',
};

export const Default = {
  render: () => html`
<mlv-segment-button behavior-select>
  <mlv-button value="sessions" pressed>sessions</mlv-button>
  <mlv-button value="uploads">uploads</mlv-button>
  <mlv-button disabled value="settings">settings</mlv-button>
</mlv-segment-button>
  `
};

export const IconButtons = {
  render: () => html`
<mlv-segment-button behavior-select>
  <mlv-icon-button pressed value="vertical" aria-label="split vertical" icon-name="split-vertical"></mlv-icon-button>
  <mlv-icon-button value="horizontal" aria-label="split horizontal" icon-name="split-horizontal"></mlv-icon-button>
  <mlv-icon-button value="none" aria-label="split none" icon-name="split-none"></mlv-icon-button>
</mlv-segment-button>
  `
};