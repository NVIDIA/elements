import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/toast/define.js';


export default {
  title: 'Elements/Toast/Examples',
  component: 'nve-toast',
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left', 'center'],
      defaultValue: 'top'
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      defaultValue: 'center'
    }
  }
};

type ArgTypes = Toast;

export const Default = {
  render: (args: ArgTypes) => html`
    <nve-toast ${spread(args)}>${args.textContent}</nve-toast>
  `,
  args: { textContent: 'hello there', position: 'center' }
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
    default <nve-button interaction="ghost">action</nve-button>
  </nve-toast>
  <nve-toast status="success" position="right">
    success <nve-button interaction="ghost">action</nve-button>
  </nve-toast>
  <nve-toast status="warning" position="bottom">
    warning <nve-button interaction="ghost">action</nve-button>
  </nve-toast>
  <nve-toast status="danger" position="left">
    danger <nve-button interaction="ghost">action</nve-button>
  </nve-toast>
</div>
  `
};

export const Interactive = {
  render: () => html`
<div nve-layout="row align:center" style="height: 90vh">
  <nve-button id="btn">copy to clipboard</nve-button>
  <nve-toast anchor="btn" position="top" close-timeout="1500" hidden>copied!</nve-toast>
</div>
<script type="module">
  const btn = document.querySelector('#btn');
  const toast = document.querySelector('nve-toast');
  btn.addEventListener('click', () => toast.hidden = false);
  toast.addEventListener('close', () => toast.hidden = true);
</script>
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

<nve-toast position="center">center</nve-toast>
<nve-toast position="top" alignment="start">top start</nve-toast>
<nve-toast position="top">top center</nve-toast>
<nve-toast position="top" alignment="end">top end</nve-toast>
<nve-toast position="right" alignment="start">right start</nve-toast>
<nve-toast position="right">right center</nve-toast>
<nve-toast position="right" alignment="end">right end</nve-toast>
<nve-toast position="bottom" alignment="start">bottom start</nve-toast>
<nve-toast position="bottom">bottom center</nve-toast>
<nve-toast position="bottom" alignment="end">bottom end</nve-toast>
<nve-toast position="left" alignment="start">left start</nve-toast>
<nve-toast position="left">left center</nve-toast>
<nve-toast position="left" alignment="end">left end</nve-toast>
<style>
  #root-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100vh;
  }
</style>
  `
};
