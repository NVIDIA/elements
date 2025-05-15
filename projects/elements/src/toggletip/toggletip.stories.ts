import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/toggletip/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Toggletip',
  component: 'nve-toggletip',
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  render: () => html`
<nve-toggletip id="toggletip">hello there</nve-toggletip>
<nve-button popovertarget="toggletip">button</nve-button>
`
};

export const Visual = {
  render: () => html`
<nve-toggletip anchor="toggletip-btn">hello there</nve-toggletip>
<nve-button id="toggletip-btn">button</nve-button>
`
};

export const Content = {
  render: () => html`
<nve-toggletip anchor="btn">
  <nve-toggletip-header>
    <h3 nve-text="heading sm">Toggletip Header</h3>
  </nve-toggletip-header>
    <p nve-text="body">some text content in a toggletip</p>
  <nve-toggletip-footer>
    <p nve-text="body">Toggletip Footer</p>
  </nve-toggletip-footer>
</nve-toggletip>
<nve-button id="btn">button</nve-button>
`
};

export const Events = {
  render: () => html`
<nve-toggletip id="toggletip">hello there</nve-toggletip>
<nve-button popovertarget="toggletip">button</nve-button>
<script type="module">
  const toggletip = document.querySelector('nve-toggletip');
  toggletip.addEventListener('close', () => console.log('close'));
  toggletip.addEventListener('open', () => console.log('open'));
</script>
  `
};

export const Closable = {
  render: () => html`
<nve-toggletip anchor="btn" closable>
  <nve-toggletip-header>Toggletip Header</nve-toggletip-header>
    <p nve-text="body">some text content in a toggletip</p>
  <nve-toggletip-footer>Toggletip Footer</nve-toggletip-footer>
</nve-toggletip>
<nve-button id="btn">button</nve-button>
  `
};

export const AlertGroup = {
  inline: false,
  render: () => html`
<nve-toggletip anchor="btn" behavior-trigger trigger="btn">
  <nve-toggletip-header>
    <nve-alert-group status="danger" container="full" prominence="emphasis">
      <nve-alert>Workflow Failed</nve-alert>
    </nve-alert-group>
  </nve-toggletip-header>
  <p nve-text="body">some text content in a toggletip</p>
  <nve-toggletip-footer>
    <nve-button style="width: 100%">Retry Workflow</nve-button>  
  </nve-toggletip-footer>
</nve-toggletip>
<nve-button id="btn">button</nve-button>
  `
};

export const Position = {
  render: () => html`
<nve-toggletip anchor="btn" position="top">top</nve-toggletip>
<nve-toggletip anchor="btn" position="right">right</nve-toggletip>
<nve-toggletip anchor="btn" position="bottom">bottom</nve-toggletip>
<nve-toggletip anchor="btn" position="left">left</nve-toggletip>
<nve-button id="btn">button</nve-button>
  `
};

export const Alignment = {
  render: () => html`
<nve-toggletip anchor="card" position="top" alignment="start">top start</nve-toggletip>
<nve-toggletip anchor="card" position="top">top center</nve-toggletip>
<nve-toggletip anchor="card" position="top" alignment="end">top end</nve-toggletip>

<nve-toggletip anchor="card" position="right" alignment="start">right start</nve-toggletip>
<nve-toggletip anchor="card" position="right">right center</nve-toggletip>
<nve-toggletip anchor="card" position="right" alignment="end">right end</nve-toggletip>

<nve-toggletip anchor="card" position="bottom" alignment="start">bottom start</nve-toggletip>
<nve-toggletip anchor="card" position="bottom">bottom center</nve-toggletip>
<nve-toggletip anchor="card" position="bottom" alignment="end">bottom end</nve-toggletip>

<nve-toggletip anchor="card" position="left" alignment="start">left start</nve-toggletip>
<nve-toggletip anchor="card" position="left">left center</nve-toggletip>
<nve-toggletip anchor="card" position="left" alignment="end">left end</nve-toggletip>

<nve-card id="card" style="width: 400px; height: 200px;"></nve-card>
  `
};

export const LegacyBehaviorTrigger = {
  render: () => html`
<nve-toggletip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</nve-toggletip>
<nve-button id="action-btn">button</nve-button>
  `
};
