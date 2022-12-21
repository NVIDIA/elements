import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Tooltip } from '@elements/elements/tooltip';
import '@elements/elements/card/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/button/define.js';

export default {
  title: 'Elements/Tooltip/Examples',
  component: 'nve-tooltip',
  parameters: { badges: ['alpha'] },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left']
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      defaultValue: 'center'
    }
  }
};

type ArgTypes = Tooltip;

export const Default = {
  render: (args: ArgTypes) => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-tooltip anchor="btn" ${spread(args)}>${args.textContent}</nve-tooltip>
  <nve-button id="btn">button</nve-button>
</div>
  `,
  args: { textContent: 'hello there', position: 'top' }
};

export const Interactive = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-tooltip anchor="action-btn" trigger="action-btn" hidden>hello there</nve-tooltip>
  <nve-button id="action-btn">button</nve-button>
  <script type="module">
    const tooltip = document.querySelector('nve-tooltip[anchor="action-btn"]');
    tooltip.addEventListener('close', () => tooltip.hidden = true);
    tooltip.addEventListener('open', () => tooltip.hidden = false);
  </script>
</div>
  `
};

export const Content = {
  render: () => html`
<div nve-layout="row align:center" style="height: 150px">
  <nve-tooltip anchor="btn" position="bottom">
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content</p>
  </nve-tooltip>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

export const Position = {
  render: () => html`
<div nve-layout="row align:center" style="height: 200px">
  <nve-tooltip anchor="btn" position="top">top</nve-tooltip>
  <nve-tooltip anchor="btn" position="right">right</nve-tooltip>
  <nve-tooltip anchor="btn" position="bottom">bottom</nve-tooltip>
  <nve-tooltip anchor="btn" position="left">left</nve-tooltip>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

export const Alignment = {
  render: () => html`
<div nve-theme nve-layout="row align:center" style="width: 100%; height: 600px;">
  <nve-tooltip anchor="card" position="top" alignment="start">top start</nve-tooltip>
  <nve-tooltip anchor="card" position="top">top center</nve-tooltip>
  <nve-tooltip anchor="card" position="top" alignment="end">top end</nve-tooltip>

  <nve-tooltip anchor="card" position="right" alignment="start">right start</nve-tooltip>
  <nve-tooltip anchor="card" position="right">right center</nve-tooltip>
  <nve-tooltip anchor="card" position="right" alignment="end">right end</nve-tooltip>

  <nve-tooltip anchor="card" position="bottom" alignment="start">bottom start</nve-tooltip>
  <nve-tooltip anchor="card" position="bottom">bottom center</nve-tooltip>
  <nve-tooltip anchor="card" position="bottom" alignment="end">bottom end</nve-tooltip>

  <nve-tooltip anchor="card" position="left" alignment="start">left start</nve-tooltip>
  <nve-tooltip anchor="card" position="left">left center</nve-tooltip>
  <nve-tooltip anchor="card" position="left" alignment="end">left end</nve-tooltip>

  <nve-card id="card" style="width: 450px; height: 300px;"></nve-card>
</div>
  `
};
