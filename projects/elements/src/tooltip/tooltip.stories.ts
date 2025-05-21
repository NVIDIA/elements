import type { PropertyValues } from 'lit';
import { html, css, LitElement } from 'lit';
import type { Ref} from 'lit/directives/ref.js';
import { ref, createRef } from 'lit/directives/ref.js';
import { customElement } from 'lit/decorators/custom-element.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/dialog/define.js';
import type { Badge } from '@nvidia-elements/core/badge';
import type { Tooltip } from '@nvidia-elements/core/tooltip';

export default {
  title: 'Elements/Tooltip',
  component: 'nve-tooltip',
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  render: () => html`
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
  `
};

export const Visual = {
  render: () => html`
<nve-tooltip anchor="btn">hello there</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

export const Position = {
  render: () => html`
<nve-tooltip anchor="btn" position="top">top</nve-tooltip>
<nve-tooltip anchor="btn" position="right">right</nve-tooltip>
<nve-tooltip anchor="btn" position="bottom">bottom</nve-tooltip>
<nve-tooltip anchor="btn" position="left">left</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

export const Alignment = {
  render: () => html`
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

<nve-card id="card" style="width: 400px; height: 200px;"></nve-card>
  `
};

export const Events = {
  render: () => html`
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
<script type="module">
  const tooltip = document.querySelector('nve-tooltip');
  tooltip.addEventListener('close', () => console.log('close'));
  tooltip.addEventListener('open', () => console.log('open'));
</script>
  `
};

export const Content = {
  render: () => html`
<nve-tooltip anchor="btn" position="bottom">
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content</p>
</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

export const OpenDelay = {
  render: () => html`
<nve-tooltip id="delay-tooltip" open-delay="500">delayed tooltip</nve-tooltip>
<nve-button popovertarget="delay-tooltip">button</nve-button>
  `
};

export const DynamicTrigger = {
  render: () => html`
<nve-tooltip id="dynamic-popover"></nve-tooltip>

<div nve-layout="row gap:sm">
  <nve-button popovertarget="dynamic-popover">one</nve-button>
  <nve-button popovertarget="dynamic-popover">two</nve-button>
  <nve-button popovertarget="dynamic-popover">three</nve-button>
</div>

<script type="module">
  document.querySelector('#dynamic-popover').addEventListener('open', e => {
    e.target.textContent = 'tooltip ' + e.detail.trigger.textContent;
  });
</script>
  `
};

export const Hint = {
  render: () => html`
<div nve-layout="row gap:xs align:vertical-center">
  <h2 nve-text="heading sm">Preview</h2>
  <nve-icon-button container="flat" icon-name="information-circle-stroke" popovertarget="hint"></nve-icon-button>
  <nve-tooltip id="hint" position="right">Preview in progress CI tasks for the active host</nve-tooltip>
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

export const Wrap = {
  render: () => html`
<nve-tooltip anchor="btn" style="--width: 200px">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

export const PositionStrategyAbsolute = {
  render: () => html`
<nve-tooltip id="tooltip" position-strategy="absolute">hello there</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
  `
};

export const ScrollContainer = {
  render: () => html`
<style>
  #scroll-container {
    display: flex;
    flex-direction: column;
    height: 300px;
    width: 200px;
    overflow-y: auto;
    border: 1px solid #ccc;
    margin: 20vh;

    & > button {
      min-height: 50px;
      width: 100%;
    }
  }
</style>
<section id="scroll-container">
  <button popovertarget="tooltip">1</button>
  <button popovertarget="tooltip">2</button>
  <button popovertarget="tooltip">3</button>
  <button popovertarget="tooltip">4</button>
  <button popovertarget="tooltip">5</button>
  <button popovertarget="tooltip">6</button>
  <button popovertarget="tooltip">7</button>
  <button popovertarget="tooltip">8</button>
  <button popovertarget="tooltip">9</button>
  <button popovertarget="tooltip">10</button>
</section>
<nve-tooltip id="tooltip" position="left">hello there</nve-tooltip>
  `
};

@customElement('dynamic-anchor-position-demo')
class DynamicAnchorPositionDemo extends LitElement { /* eslint no-unused-vars: 0 */
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

export const LegacyDynamicTrigger = {
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
      if (e.target.tagName === 'NVE-BUTTON') {
        tooltip.anchor = e.target;
        tooltip.trigger = e.target;
      }
    });
  </script>
</div>
  `
};

export const LegacyTrigger = {
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

export const LegacyBehaviorTrigger = {
  render: () => html`
<nve-tooltip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</nve-tooltip>
<nve-button id="action-btn">button</nve-button>
  `
};

export const LegacyOpenDelay = {
  render: () => html`
<nve-tooltip behavior-trigger anchor="delay-tooltip-1" trigger="delay-tooltip-1" open-delay="500" hidden>delayed tooltip</nve-tooltip>
<nve-button id="delay-tooltip-1">button</nve-button>

<nve-tooltip behavior-trigger anchor="delay-tooltip-2" trigger="delay-tooltip-2" open-delay="500" hidden>delayed tooltip</nve-tooltip>
<nve-button id="delay-tooltip-2">button</nve-button>

<nve-tooltip behavior-trigger anchor="delay-tooltip-3" trigger="delay-tooltip-3" open-delay="500" hidden>delayed tooltip</nve-tooltip>
<nve-button id="delay-tooltip-3">button</nve-button>
  `
};

@customElement('cross-shadow-root-anchor-position-demo')
class CrossShadowRootAnchorPositionDemo extends LitElement {
  render() {
    return html`
      <nve-tooltip id="shadow-root-tooltip">shadow root tooltip</nve-tooltip>
      <nve-button id="shadow-root-btn" popovertarget="shadow-root-tooltip">shadow root anchor</nve-button>
      <nve-button id="cross-root-btn">cross root anchor</nve-button>
    `;
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    document.querySelector<Tooltip>('#cross-root-tooltip').anchor = this.shadowRoot.querySelector<HTMLElement>('#cross-root-btn');
    document.querySelector<Tooltip>('#cross-root-tooltip').trigger = this.shadowRoot.querySelector<HTMLElement>('#cross-root-btn');
  }
}

export const CrossShadowRootAnchorPosition = {
  render: () => html`
<nve-button popovertarget="root-tooltip">document root anchor</nve-button>
<nve-tooltip id="root-tooltip">document root tooltip</nve-tooltip>

<cross-shadow-root-anchor-position-demo></cross-shadow-root-anchor-position-demo>
<nve-tooltip id="cross-root-tooltip" hidden behavior-trigger>cross root tooltip</nve-tooltip>
  `
};

export const NestedDynamic = {
  render: () => html`
<nve-button popovertarget="dialog">open</nve-button>
<nve-dialog id="dialog" size="lg" modal closable>
  <nve-button popovertarget="tooltip">button</nve-button>
  <section>
    <button popovertarget="tooltip">button</button>
  </section>
</nve-dialog>
<nve-tooltip id="tooltip">test</nve-tooltip>
  `
};
