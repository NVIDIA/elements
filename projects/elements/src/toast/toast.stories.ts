import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/toast/define.js';

export default {
  title: 'Elements/Toast',
  component: 'nve-toast',
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  render: () => html`
<nve-toast id="toast" close-timeout="1500">hello there</nve-toast>
<nve-button popovertarget="toast">button</nve-button>
`
};

export const Visual = {
  render: () => html`
<nve-toast anchor="btn">hello there</nve-toast>
<nve-button id="btn">button</nve-button>
`
};

export const Status = {
  render: () => html`
<div nve-layout="row align:center" style="height: 200px">
  <nve-toast position="top">default</nve-toast>
  <nve-toast status="success" position="right">success</nve-toast>
  <nve-toast status="warning" position="bottom">warning</nve-toast>
  <nve-toast status="danger" position="left">danger</nve-toast>
</div>
  `
};

export const Actions = {
  render: () => html`
<div nve-layout="row align:center" style="height: 200px">
  <nve-toast position="top">
    default <nve-button container="inline">action</nve-button>
  </nve-toast>
  <nve-toast status="success" position="right">
    success <nve-button container="inline">action</nve-button>
  </nve-toast>
  <nve-toast status="warning" position="bottom">
    warning <nve-button container="inline">action</nve-button>
  </nve-toast>
  <nve-toast status="danger" position="left">
    danger <nve-button container="inline">action</nve-button>
  </nve-toast>
</div>
  `
};

export const Events = {
  render: () => html`
<nve-toast id="toast">hello there</nve-toast>
<nve-button popovertarget="toast">button</nve-button>
<script type="module">
  const toast = document.querySelector('nve-toast');
  toast.addEventListener('close', () => console.log('close'));
  toast.addEventListener('open', () => console.log('open'));
</script>
  `
};

export const Position = {
  render: () => html`
<nve-toast anchor="btn" position="top">top</nve-toast>
<nve-toast anchor="btn" position="right">right</nve-toast>
<nve-toast anchor="btn" position="bottom">bottom</nve-toast>
<nve-toast anchor="btn" position="left">left</nve-toast>
<nve-button id="btn">button</nve-button>
  `
};

export const Alignment = {
  render: () => html`
<nve-card id="card" style="width: 450px; height: 300px;"></nve-card>
<nve-toast anchor="card" position="top" alignment="start">top start</nve-toast>
<nve-toast anchor="card" position="top">top center</nve-toast>
<nve-toast anchor="card" position="top" alignment="end">top end</nve-toast>
<nve-toast anchor="card" position="right" alignment="start">right start</nve-toast>
<nve-toast anchor="card" position="right">right center</nve-toast>
<nve-toast anchor="card" position="right" alignment="end">right end</nve-toast>
<nve-toast anchor="card" position="bottom" alignment="start">bottom start</nve-toast>
<nve-toast anchor="card" position="bottom">bottom center</nve-toast>
<nve-toast anchor="card" position="bottom" alignment="end">bottom end</nve-toast>
<nve-toast anchor="card" position="left" alignment="start">left start</nve-toast>
<nve-toast anchor="card" position="left">left center</nve-toast>
<nve-toast anchor="card" position="left" alignment="end">left end</nve-toast>
  `
};

export const LegacyBehaviorTrigger = {
  render: () => html`
<div nve-layout="row align:center" style="height: 90vh">
  <nve-button id="btn">copy to clipboard</nve-button>
  <nve-toast trigger="btn" behavior-trigger position="top" close-timeout="1500" hidden>copied!</nve-toast>
</div>
`
};

export const ShadowRoot = {
  render: () => html`
<toast-test-shadow-root></toast-test-shadow-root>
<script type="module">
  customElements.define('toast-test-shadow-root', class ToastTestShadowRoot extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({mode: 'open'});

      const template = document.createElement('template');
      template.innerHTML = \`
        <style>:host { box-sizing: border-box; }</style>
        <nve-toast size="sm">center</nve-toast>

        <nve-toast size="sm" position="top">top center</nve-toast>
        <nve-toast size="sm" position="top" alignment="start">top start</nve-toast>
        <nve-toast size="sm" position="top" alignment="end">top end</nve-toast>

        <nve-toast size="sm" position="right" alignment="start">right start</nve-toast>
        <nve-toast size="sm" position="right">right center</nve-toast>
        <nve-toast size="sm" position="right" alignment="end">right end</nve-toast>

        <nve-toast size="sm" position="bottom" alignment="start">bottom start</nve-toast>
        <nve-toast size="sm" position="bottom">bottom center</nve-toast>
        <nve-toast size="sm" position="bottom" alignment="end">bottom end</nve-toast>

        <nve-toast size="sm" position="left" alignment="start">left start</nve-toast>
        <nve-toast size="sm" position="left">left center</nve-toast>
        <nve-toast size="sm" position="left" alignment="end">left end</nve-toast>
      \`;
      this._shadow.appendChild(template.content);
    }
  });
</script>
  `
};
