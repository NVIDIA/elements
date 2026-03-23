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

export default {
  title: 'Elements/Tooltip',
  component: 'nve-tooltip',
  parameters: {
    layout: 'centered'
  }
};

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

/**
 * @summary Basic tooltip triggered by popovertarget attribute. Use for providing brief, contextual information on hover or focus without cluttering the interface.
 */
export const Default = {
  render: () => html`
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button interestfor="tooltip">button</nve-button>
  `
};

/**
 * @summary Tooltip using anchor attribute to reference the trigger element. Use when you need to explicitly connect tooltips to their triggers by ID for better control over relationships.
 * @tags test-case
 */
export const Visual = {
  render: () => html`
<nve-tooltip anchor="btn">hello there</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @summary Tooltip positioning options for optimal placement relative to trigger elements. Use different positions based on available screen space and content layout to ensure tooltips remain visible and don't obscure important content.
 * @tags test-case
 */
export const Position = {
  render: () => html`
<nve-tooltip anchor="btn" position="top">top</nve-tooltip>
<nve-tooltip anchor="btn" position="right">right</nve-tooltip>
<nve-tooltip anchor="btn" position="bottom">bottom</nve-tooltip>
<nve-tooltip anchor="btn" position="left">left</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @summary Fine-grained tooltip alignment combined with positioning for precise placement control. Use to align tooltips to specific edges of trigger elements, improving visual hierarchy and reducing overlap with other UI elements.
 * @tags test-case
 */
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

/**
 * @summary Event handling for tooltip lifecycle events. Useful for adding custom behavior when tooltip state changes.
 */
export const Events = {
  render: () => html`
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button interestfor="tooltip">button</nve-button>
<script type="module">
  const tooltip = document.querySelector('nve-tooltip');
  tooltip.addEventListener('beforetoggle', () => console.log('beforetoggle'));
  tooltip.addEventListener('toggle', () => console.log('toggle'));
  tooltip.addEventListener('close', () => console.log('close'));
  tooltip.addEventListener('open', () => console.log('open'));
</script>
  `
};

/**
 * @summary Tooltip with structured content including title and body text. Use for tooltips that need hierarchical information, but keep content brief to maintain tooltip's lightweight nature.
 */
export const Content = {
  render: () => html`
<nve-tooltip anchor="btn" position="bottom">
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content</p>
</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @summary Single tooltip shared across many triggers with dynamic content updates. Use to reduce DOM nodes and improve performance when many similar elements need contextual help, updating tooltip content based on which trigger activated it.
 */
export const DynamicTrigger = {
  render: () => html`
<nve-tooltip id="dynamic-popover"></nve-tooltip>

<div nve-layout="row gap:sm align:center">
  <nve-button interestfor="dynamic-popover">one</nve-button>
  <nve-button interestfor="dynamic-popover">two</nve-button>
  <nve-button interestfor="dynamic-popover">three</nve-button>
</div>

<script type="module">
  document.querySelector('#dynamic-popover').addEventListener('toggle', e => {
    if (e.newState === 'open') {
      e.target.textContent = 'tooltip ' + e.source.textContent;
    }
  });
</script>
  `
};

/**
 * @summary Tooltip as a hint icon pattern for providing contextual help next to labels or headings. Perfect for explaining features or terminology without cluttering the main interface, allowing users to discover information on demand.
 */
export const Hint = {
  render: () => html`
<div nve-layout="row gap:xs align:vertical-center">
  <h2 nve-text="heading sm">Preview</h2>
  <nve-icon-button container="flat" icon-name="information-circle-stroke" interestfor="hint"></nve-icon-button>
  <nve-tooltip id="hint" position="right">Preview in progress CI tasks for the active host</nve-tooltip>
</div>
  `
};

/**
 * @summary Tooltip with muted status variant for subtle, low-emphasis contextual information. Use muted tooltips when the information is supplementary and shouldn't draw attention away from primary content.
 */
export const Status = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-tooltip anchor="btn">default status</nve-tooltip>
  <nve-tooltip anchor="btn" position="bottom" status="muted">muted status</nve-tooltip>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

/**
 * @summary Tooltip with constrained width for controlled text wrapping. Use when tooltip content is longer than a single line, but prefer keeping tooltips brief for better scannability and user experience.
 * @tags test-case
 */
export const Wrap = {
  render: () => html`
<nve-tooltip anchor="btn" style="--width: 200px">
  Tooltips provide contextual help for interface elements. Keep content brief and descriptive to help users understand available actions.
</nve-tooltip>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @summary Tooltip anchoring to a dynamically created anchor element.
 * @tags test-case
 */
export const AsyncTrigger = {
  render: () => html`
<div id="async-trigger-demo">
  <nve-tooltip id="tooltip">hello there</nve-tooltip>
  <template><nve-button interestfor="tooltip">button</nve-button></template>
</div>
<script type="module">
  import '@nvidia-elements/core/button/define.js';
  import '@nvidia-elements/core/tooltip/define.js';
  const template = document.querySelector('#async-trigger-demo template');
  const instance = template.content.cloneNode(true);
  setTimeout(() => {
    document.querySelector('#async-trigger-demo').appendChild(instance);
  }, 1000);
</script>
  `
};

/**
 * @summary Tooltip with absolute positioning strategy for precise placement in complex layouts. Use when default fixed positioning causes issues with scrolling containers or nested positioning contexts.
 * @tags test-case
 */
export const PositionStrategyAbsolute = {
  render: () => html`
<nve-button interestfor="tooltip">button</nve-button>
<nve-tooltip id="tooltip">hello there</nve-tooltip>
  `
};

/**
 * @summary Tooltip behavior within scrollable containers with automatic repositioning. Tooltips maintain visibility and proper positioning even when anchor elements scroll, ensuring consistent user experience in scrollable interfaces.
 * @tags test-case
 */
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
  <button interestfor="tooltip">1</button>
  <button interestfor="tooltip">2</button>
  <button interestfor="tooltip">3</button>
  <button interestfor="tooltip">4</button>
  <button interestfor="tooltip">5</button>
  <button interestfor="tooltip">6</button>
  <button interestfor="tooltip">7</button>
  <button interestfor="tooltip">8</button>
  <button interestfor="tooltip">9</button>
  <button interestfor="tooltip">10</button>
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

/**
 * @summary Tooltip that follows a dynamically positioned anchor element. Real-time tooltip repositioning as the anchor moves, useful for cursor-following tooltips or drag-and-drop interfaces.
 * @deprecated
 * @tags test-case
 */
export const DynamicAnchorPosition = {
  render: () => html`
<dynamic-anchor-position-demo></dynamic-anchor-position-demo>
  `
};

/* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */

/**
 * @deprecated
 * @summary Legacy pattern for dynamic tooltip triggers using behavior-trigger attribute. Programmatic anchor and trigger reassignment for backward compatibility with older implementations.
 * @deprecated
 * @tags test-case
 */
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

/**
 * @deprecated
 * @summary Legacy trigger pattern with manual event handling and hidden attribute management. Older implementation approach for backward compatibility; prefer using popovertarget for new implementations.
 * @deprecated
 * @tags test-case
 */
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

/**
 * @deprecated
 * @summary Legacy behavior-trigger pattern for automatic tooltip lifecycle management. Deprecated approach that auto-manages visibility, prefer modern popovertarget API for new implementations.
 * @deprecated
 * @tags test-case
 */
export const LegacyBehaviorTrigger = {
  render: () => html`
<nve-tooltip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</nve-tooltip>
<nve-button id="action-btn">button</nve-button>
  `
};

/**
 * @deprecated
 * @summary Legacy implementation combining behavior-trigger with open-delay for many tooltips. Older pattern for delayed tooltip appearance; prefer modern popovertarget with open-delay attribute.
 * @deprecated
 * @tags test-case
 */
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

/**
 * @summary Tooltip functionality within modal dialogs with many triggers. Ensures tooltips work correctly in layered UI contexts, maintaining proper stacking order and interaction behavior within modal overlays.
 * @tags test-case
 */
export const NestedDynamic = {
  render: () => html`
<nve-button popovertarget="dialog">open</nve-button>
<nve-dialog id="dialog" size="lg" modal closable>
  <nve-button interestfor="tooltip">button</nve-button>
  <section>
    <button interestfor="tooltip">button</button>
  </section>
</nve-dialog>
<nve-tooltip id="tooltip">test</nve-tooltip>
  `
};

/**
 * @summary Tooltip functionality using interest invokers to control tooltip visibility on hover and focus.
 * @tags test-case
 */
export const InterestInvokers = {
  render: () => html`
<section nve-layout="row gap:md align:center">
  <button popovertarget="dropdown" interestfor="tooltip">open</button>
  <nve-button popovertarget="dropdown" interestfor="tooltip">open</nve-button>
  <nve-dropdown id="dropdown">dropdown content</nve-dropdown>
  <nve-tooltip id="tooltip">tooltip content</nve-tooltip>

  <div id="div">static</div>
  <nve-tooltip trigger="div" hidden>static</nve-tooltip>
</section>
  `
};

/**
 * @summary Tooltip with delayed appearance to reduce visual noise during quick mouse movements. Use open-delay for better user experience when tooltips are dense, preventing tooltips from flashing during cursor transitions.
 * @deprecated
 * @tags test-case
 */
export const OpenDelay = {
  render: () => html`
<nve-tooltip id="delay-tooltip" open-delay="500">delayed tooltip</nve-tooltip>
<nve-button interestfor="delay-tooltip">button</nve-button>
  `
};

/**
 * @summary Legacy behavior that allowed tooltip triggering via popovertarget attribute instead of interestfor attribute with hover events.
 * @deprecated
 * @tags test-case
 */
export const LegacyPopoverTarget = {
  render: () => html`
  <nve-button popovertarget="tooltip">open</nve-button>
  <nve-tooltip id="tooltip">tooltip content</nve-tooltip>
  `
};
