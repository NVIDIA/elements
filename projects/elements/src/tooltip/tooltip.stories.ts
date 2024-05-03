import { html, css, LitElement, PropertyValues } from 'lit';
import { Ref, ref, createRef } from 'lit/directives/ref.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { spread } from '@nvidia-elements/core/internal';
import { Tooltip } from '@nvidia-elements/core/tooltip';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import type { Badge } from '@nvidia-elements/core/badge';

export default {
  title: 'Elements/Tooltip/Examples',
  component: 'nve-tooltip',
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

export const BehaviorTrigger = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-tooltip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</nve-tooltip>
  <nve-button id="action-btn">button</nve-button>
</div>
  `
};

export const OpenDelay = {
  render: () => html`
<div nve-layout="row align:center gap:sm" style="height: 250px">
  <nve-tooltip behavior-trigger anchor="delay-tooltip-1" trigger="delay-tooltip-1" open-delay="500" hidden>delayed tooltip</nve-tooltip>
  <nve-button id="delay-tooltip-1">button</nve-button>

  <nve-tooltip behavior-trigger anchor="delay-tooltip-2" trigger="delay-tooltip-2" open-delay="500" hidden>delayed tooltip</nve-tooltip>
  <nve-button id="delay-tooltip-2">button</nve-button>

  <nve-tooltip behavior-trigger anchor="delay-tooltip-3" trigger="delay-tooltip-3" open-delay="500" hidden>delayed tooltip</nve-tooltip>
  <nve-button id="delay-tooltip-3">button</nve-button>
</div>
  `
};

export const DynamicTrigger = {
  render: () => html`
<div id="dynamic-trigger-demo" nve-layout="row align:center" style="height: 250px">
  <nve-tooltip behavior-trigger hidden>hello there</nve-tooltip>
  <div nve-layout="row gap:xl">
    <nve-button>button</nve-button>
    <nve-button>button</nve-button>
    <nve-button>button</nve-button>
  </div>
  <script type="module">
    const tooltip = document.querySelector('#dynamic-trigger-demo nve-tooltip');
    document.querySelector('#dynamic-trigger-demo').addEventListener('mouseover', e => {
      if (e.target.tagName === 'MLV-BUTTON') {
        tooltip.anchor = e.target;
        tooltip.trigger = e.target;
      }
    });
  </script>
</div>
  `
};

export const Hint = {
  render: () => html`
<div nve-layout="block align:vertical-center" style="height: 90vh">
  <nve-tooltip anchor="action-btn" position="right" trigger="action-btn" hidden>Preview in progress CI tasks for the active host</nve-tooltip>
  <div nve-layout="row gap:xs align:vertical-center">
    <h2 nve-text="section">Preview</h2>
    <nve-icon-button container="flat" icon-name="information-circle-stroke" id="action-btn"></nve-icon-button>
  </div>
  <script type="module">
    const tooltip = document.querySelector('nve-tooltip[anchor="action-btn"]');
    tooltip.addEventListener('close', () => tooltip.hidden = true);
    tooltip.addEventListener('open', () => tooltip.hidden = false);
  </script>
</div>
  `
};

export const HintCopy = {
  render: () => html`
<div nve-layout="row align:center" style="height: 90vh">
  <nve-tooltip trigger="btn" anchor="btn" hidden>2d628479cf2db27cbdebbfe41a42f1c9e07c46a8</nve-tooltip>
  <nve-toast trigger="btn" anchor="btn" close-timeout="1500" hidden status="success">copied!</nve-toast>
  <nve-button container="flat" id="btn" aria-label="copy to clipboard">
    <p nve-text="truncate" style="width: 120px">2d628479cf2db27cbdebbfe41a42f1c9e07c46a8</p><nve-icon name="copy"></nve-icon>
  </nve-button>
</div>

<script type="module">
  const toast = document.querySelector('nve-toast');
  const tooltip = document.querySelector('nve-tooltip');
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
<div nve-layout="row align:center" style="height: 150px">
  <nve-tooltip anchor="btn" position="bottom">
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content</p>
  </nve-tooltip>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

export const Status = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-tooltip anchor="btn">default status</nve-tooltip>
  <nve-tooltip anchor="btn" position="bottom" status="muted">muted status</nve-tooltip>
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

export const Wrap = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-tooltip anchor="btn" style="--width: 200px">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  </nve-tooltip>
  <nve-button id="btn">button</nve-button>
</div>
  `
};


@customElement('dynamic-anchor-position-demo')
class DynamicAnchorPositionDemo extends LitElement {
  static styles = [css`
    :host {
      position: relative;
      width: 97vw;
      height: 97vh;
      display: block;
      left: 0;
      transition: left 1s linear;
    }

    #anchor {
      top: 50vh;
      left: 50vw;
      width: 1px;
      height: 1px;
      position: absolute;
    }
  `];

  #badge: Ref<Badge> = createRef();

  render() {
    return html`
      <div ${ref(this.#badge)} id="anchor"></div>
      <nve-tooltip anchor="anchor">tooltip</nve-tooltip>
    `;
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.addEventListener('mousemove', e => this.#badge.value.style.inset = `${e.clientY - 15}px auto auto ${e.clientX - 15}px`);
  }
}

export const DynamicAnchorPosition = {
  render: () => html`
<dynamic-anchor-position-demo></dynamic-anchor-position-demo>
  `
};
