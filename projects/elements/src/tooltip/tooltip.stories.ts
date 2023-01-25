import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Tooltip } from '@elements/elements/tooltip';
import '@elements/elements/card/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/toast/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Tooltip/Examples',
  component: 'mlv-tooltip',
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
<div mlv-layout="row align:center" style="height: 250px">
  <mlv-tooltip anchor="btn" ${spread(args)}>${args.textContent}</mlv-tooltip>
  <mlv-button id="btn">button</mlv-button>
</div>
  `,
  args: { textContent: 'hello there', position: 'top' }
};

export const Interactive = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 250px">
  <mlv-tooltip anchor="action-btn" trigger="action-btn" hidden>hello there</mlv-tooltip>
  <mlv-button id="action-btn">button</mlv-button>
  <script type="module">
    const tooltip = document.querySelector('mlv-tooltip[anchor="action-btn"]');
    tooltip.addEventListener('close', () => tooltip.hidden = true);
    tooltip.addEventListener('open', () => tooltip.hidden = false);
  </script>
</div>
  `
};

export const Hint = {
  render: () => html`
<div mlv-layout="block align:vertical-center" style="height: 90vh">
  <mlv-tooltip anchor="action-btn" position="right" trigger="action-btn" hidden>Preview in progress CI tasks for the active host</mlv-tooltip>
  <div mlv-layout="row gap:xs align:vertical-center">
    <h2 mlv-text="section">Preview</h2>
    <mlv-icon-button interaction="ghost" icon-name="information" id="action-btn"></mlv-icon-button>
  </div>
  <script type="module">
    const tooltip = document.querySelector('mlv-tooltip[anchor="action-btn"]');
    tooltip.addEventListener('close', () => tooltip.hidden = true);
    tooltip.addEventListener('open', () => tooltip.hidden = false);
  </script>
</div>
  `
};

export const HintCopy = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 90vh">
  <mlv-tooltip trigger="btn" anchor="btn" hidden>2d628479cf2db27cbdebbfe41a42f1c9e07c46a8</mlv-tooltip>
  <mlv-toast trigger="btn" anchor="btn" close-timeout="1500" hidden>copied!</mlv-toast>
  <mlv-button interaction="ghost" id="btn" aria-label="copy to clipboard">
    <p mlv-text="truncate" style="width: 120px">2d628479cf2db27cbdebbfe41a42f1c9e07c46a8</p><mlv-icon name="copy"></mlv-icon>
  </mlv-button>
</div>

<script type="module">
  const toast = document.querySelector('mlv-toast');
  const tooltip = document.querySelector('mlv-tooltip');
  tooltip.addEventListener('close', () => tooltip.hidden = true);
  tooltip.addEventListener('open', (e) => tooltip.hidden = !toast.hidden);
  toast.addEventListener('close', () => toast.hidden = true);
  toast.addEventListener('open', () => {
    toast.hidden = false;
    tooltip.hidden = true;
  });
</script>
`
};

export const Content = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 150px">
  <mlv-tooltip anchor="btn" position="bottom">
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content</p>
  </mlv-tooltip>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const Position = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 200px">
  <mlv-tooltip anchor="btn" position="top">top</mlv-tooltip>
  <mlv-tooltip anchor="btn" position="right">right</mlv-tooltip>
  <mlv-tooltip anchor="btn" position="bottom">bottom</mlv-tooltip>
  <mlv-tooltip anchor="btn" position="left">left</mlv-tooltip>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const Alignment = {
  render: () => html`
<div mlv-theme mlv-layout="row align:center" style="width: 100%; height: 600px;">
  <mlv-tooltip anchor="card" position="top" alignment="start">top start</mlv-tooltip>
  <mlv-tooltip anchor="card" position="top">top center</mlv-tooltip>
  <mlv-tooltip anchor="card" position="top" alignment="end">top end</mlv-tooltip>

  <mlv-tooltip anchor="card" position="right" alignment="start">right start</mlv-tooltip>
  <mlv-tooltip anchor="card" position="right">right center</mlv-tooltip>
  <mlv-tooltip anchor="card" position="right" alignment="end">right end</mlv-tooltip>

  <mlv-tooltip anchor="card" position="bottom" alignment="start">bottom start</mlv-tooltip>
  <mlv-tooltip anchor="card" position="bottom">bottom center</mlv-tooltip>
  <mlv-tooltip anchor="card" position="bottom" alignment="end">bottom end</mlv-tooltip>

  <mlv-tooltip anchor="card" position="left" alignment="start">left start</mlv-tooltip>
  <mlv-tooltip anchor="card" position="left">left center</mlv-tooltip>
  <mlv-tooltip anchor="card" position="left" alignment="end">left end</mlv-tooltip>

  <mlv-card id="card" style="width: 450px; height: 300px;"></mlv-card>
</div>
  `
};
