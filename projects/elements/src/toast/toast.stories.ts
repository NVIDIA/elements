import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/toast/define.js';


export default {
  title: 'Elements/Toast/Examples',
  component: 'mlv-toast',
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
    <mlv-toast ${spread(args)}>${args.textContent}</mlv-toast>
  `,
  args: { textContent: 'hello there', position: 'center' }
};

export const Status = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 200px">
  <mlv-toast position="top">default</mlv-toast>
  <mlv-toast status="success" position="right">success</mlv-toast>
  <mlv-toast status="warning" position="bottom">warning</mlv-toast>
  <mlv-toast status="danger" position="left">danger</mlv-toast>
</div>
  `
};

export const Actions = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 200px">
  <mlv-toast position="top">
    default <mlv-button container="flat">action</mlv-button>
  </mlv-toast>
  <mlv-toast status="success" position="right">
    success <mlv-button container="flat">action</mlv-button>
  </mlv-toast>
  <mlv-toast status="warning" position="bottom">
    warning <mlv-button container="flat">action</mlv-button>
  </mlv-toast>
  <mlv-toast status="danger" position="left">
    danger <mlv-button container="flat">action</mlv-button>
  </mlv-toast>
</div>
  `
};

export const Interactive = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 90vh">
  <mlv-button id="btn">copy to clipboard</mlv-button>
  <mlv-toast anchor="btn" position="top" close-timeout="1500" hidden>copied!</mlv-toast>
</div>
<script type="module">
  const btn = document.querySelector('#btn');
  const toast = document.querySelector('mlv-toast');
  btn.addEventListener('click', () => toast.hidden = false);
  toast.addEventListener('close', () => toast.hidden = true);
</script>
`
};

export const BehaviorTrigger = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 90vh">
  <mlv-button id="btn">copy to clipboard</mlv-button>
  <mlv-toast trigger="btn" behavior-trigger position="top" close-timeout="1500" hidden>copied!</mlv-toast>
</div>
`
};

export const Alignment = {
  render: () => html`
<mlv-card id="card" style="width: 450px; height: 300px;"></mlv-card>
<mlv-toast anchor="card" position="top" alignment="start">top start</mlv-toast>
<mlv-toast anchor="card" position="top">top center</mlv-toast>
<mlv-toast anchor="card" position="top" alignment="end">top end</mlv-toast>
<mlv-toast anchor="card" position="right" alignment="start">right start</mlv-toast>
<mlv-toast anchor="card" position="right">right center</mlv-toast>
<mlv-toast anchor="card" position="right" alignment="end">right end</mlv-toast>
<mlv-toast anchor="card" position="bottom" alignment="start">bottom start</mlv-toast>
<mlv-toast anchor="card" position="bottom">bottom center</mlv-toast>
<mlv-toast anchor="card" position="bottom" alignment="end">bottom end</mlv-toast>
<mlv-toast anchor="card" position="left" alignment="start">left start</mlv-toast>
<mlv-toast anchor="card" position="left">left center</mlv-toast>
<mlv-toast anchor="card" position="left" alignment="end">left end</mlv-toast>

<mlv-toast position="center">center</mlv-toast>
<mlv-toast position="top" alignment="start">top start</mlv-toast>
<mlv-toast position="top">top center</mlv-toast>
<mlv-toast position="top" alignment="end">top end</mlv-toast>
<mlv-toast position="right" alignment="start">right start</mlv-toast>
<mlv-toast position="right">right center</mlv-toast>
<mlv-toast position="right" alignment="end">right end</mlv-toast>
<mlv-toast position="bottom" alignment="start">bottom start</mlv-toast>
<mlv-toast position="bottom">bottom center</mlv-toast>
<mlv-toast position="bottom" alignment="end">bottom end</mlv-toast>
<mlv-toast position="left" alignment="start">left start</mlv-toast>
<mlv-toast position="left">left center</mlv-toast>
<mlv-toast position="left" alignment="end">left end</mlv-toast>
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
