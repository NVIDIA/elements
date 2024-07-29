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
  title: 'Elements/Toggletip/Examples',
  component: 'nve-toggletip'
};

export const Default = {
  render: () => html`
<div nve-layout="row align:center" style="height: 400px">
  <nve-toggletip anchor="btn" closable>
    <nve-toggletip-header>
      <h3 nve-text="heading sm">Toggletip Header</h3>
    </nve-toggletip-header>
      <p nve-text="body">some text content in a toggletip</p>
    <nve-toggletip-footer>
      <p nve-text="body">Toggletip Footer</p>
    </nve-toggletip-footer>
  </nve-toggletip>
  <nve-button id="btn">button</nve-button>
</div>
`
};


export const BehaviorTrigger = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-toggletip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</nve-toggletip>
  <nve-button id="action-btn">button</nve-button>
</div>
  `
};


export const Interactive = {
  inline: false,
  render: () => html`
  <div nve-theme nve-layout="row align:center" style="width: 100%; height: 200px;">
  <nve-button id="toggletip-btn">open</nve-button>
  <nve-toggletip trigger="toggletip-btn" hidden anchor="toggletip-btn">
    <nve-toggletip-header>toggletip header</nve-toggletip-header>
      <p nve-text="body">some text content in a toggletip</p>
    <nve-toggletip-footer>toggletip footer</nve-toggletip-footer>
  </nve-toggletip>
  </div>
<script>
  const toggletip = document.querySelector('nve-toggletip');
  toggletip.addEventListener('open', () => toggletip.hidden = false);
  toggletip.addEventListener('close', () => toggletip.hidden = true);
</script>
  `
};

export const Closable = {
  render: () => html`
<div nve-layout="row align:center" style="height: 400px">
  <nve-toggletip closable anchor="action-btn" trigger="action-btn">
    <nve-toggletip-header>Toggletip Header</nve-toggletip-header>
      <p nve-text="body">some text content in a toggletip</p>
    <nve-toggletip-footer>Toggletip Footer</nve-toggletip-footer>
  </nve-toggletip>
  <nve-button id="action-btn">button</nve-button>
</div>
  `
};

export const AlertGroup = {
  inline: false,
  render: () => html`
  <div nve-theme nve-layout="row align:center" style="width: 100%; height: 400px;">
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
</div>
  `
};