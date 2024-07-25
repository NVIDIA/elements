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
  component: 'mlv-toggletip'
};

export const Default = {
  render: () => html`
<div nve-layout="row align:center" style="height: 400px">
  <mlv-toggletip anchor="btn" closable>
    <mlv-toggletip-header>
      <h3 nve-text="heading sm">Toggletip Header</h3>
    </mlv-toggletip-header>
      <p nve-text="body">some text content in a toggletip</p>
    <mlv-toggletip-footer>
      <p nve-text="body">Toggletip Footer</p>
    </mlv-toggletip-footer>
  </mlv-toggletip>
  <mlv-button id="btn">button</mlv-button>
</div>
`
};


export const BehaviorTrigger = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <mlv-toggletip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</mlv-toggletip>
  <mlv-button id="action-btn">button</mlv-button>
</div>
  `
};


export const Interactive = {
  inline: false,
  render: () => html`
  <div mlv-theme nve-layout="row align:center" style="width: 100%; height: 200px;">
  <mlv-button id="toggletip-btn">open</mlv-button>
  <mlv-toggletip trigger="toggletip-btn" hidden anchor="toggletip-btn">
    <mlv-toggletip-header>toggletip header</mlv-toggletip-header>
      <p nve-text="body">some text content in a toggletip</p>
    <mlv-toggletip-footer>toggletip footer</mlv-toggletip-footer>
  </mlv-toggletip>
  </div>
<script>
  const toggletip = document.querySelector('mlv-toggletip');
  toggletip.addEventListener('open', () => toggletip.hidden = false);
  toggletip.addEventListener('close', () => toggletip.hidden = true);
</script>
  `
};

export const Closable = {
  render: () => html`
<div nve-layout="row align:center" style="height: 400px">
  <mlv-toggletip closable anchor="action-btn" trigger="action-btn">
    <mlv-toggletip-header>Toggletip Header</mlv-toggletip-header>
      <p nve-text="body">some text content in a toggletip</p>
    <mlv-toggletip-footer>Toggletip Footer</mlv-toggletip-footer>
  </mlv-toggletip>
  <mlv-button id="action-btn">button</mlv-button>
</div>
  `
};

export const AlertGroup = {
  inline: false,
  render: () => html`
  <div mlv-theme nve-layout="row align:center" style="width: 100%; height: 400px;">
    <mlv-toggletip anchor="btn" behavior-trigger trigger="btn">
        <mlv-toggletip-header>
            <mlv-alert-group status="danger" container="full" prominence="emphasis">
                <mlv-alert>Workflow Failed</mlv-alert>
            </mlv-alert-group>
        </mlv-toggletip-header>
        <p nve-text="body">some text content in a toggletip</p>
        <mlv-toggletip-footer>
            <mlv-button style="width: 100%">Retry Workflow</mlv-button>  
        </mlv-toggletip-footer>
    </mlv-toggletip>
    <mlv-button id="btn">button</mlv-button>
</div>
  `
};