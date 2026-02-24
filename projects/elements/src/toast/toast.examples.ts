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

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

/**
 * @summary Basic toast with auto-dismiss for brief, non-critical feedback messages. Use toasts for lightweight confirmations like "Saved", "Copied", or "Action complete" that inform users without requiring interaction or disrupting workflow.
 */
export const Default = {
  render: () => html`
<nve-toast id="toast" close-timeout="1500">hello there</nve-toast>
<nve-button popovertarget="toast">button</nve-button>
`
};

/**
 * @summary Visual example of toast structure with anchor positioning for consistent implementation patterns across your application.
 * @tags test-case
 */
export const Visual = {
  render: () => html`
<nve-toast anchor="btn">hello there</nve-toast>
<nve-button id="btn">button</nve-button>
`
};

/**
 * @summary Toast status variants for different feedback types. Use success for confirmations, warning for cautions, and danger for error notifications, helping users quickly identify message importance through color and iconography.
 */
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

/**
 * @summary Muted toast variant for subtle, low-priority feedback. Use muted prominence when the message is informative but shouldn't draw significant attention, maintaining user focus on primary tasks.
 */
export const Prominence = {
  render: () => html`<nve-toast position="top" prominence="muted">muted</nve-toast>`
};

/**
 * @summary Toast with inline action buttons for quick follow-up actions. Use sparingly for important actions like "Undo" or "View", but prefer simple toasts without actions for most feedback to maintain lightweight nature.
 */
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

/**
 * @summary Event handling for toast lifecycle events. Useful for adding custom behavior when toast state changes.
 */
export const Events = {
  render: () => html`
<nve-toast id="toast">hello there</nve-toast>
<nve-button popovertarget="toast">button</nve-button>
<script type="module">
  const toast = document.querySelector('nve-toast');
  toast.addEventListener('beforetoggle', () => console.log('beforetoggle'));
  toast.addEventListener('toggle', () => console.log('toggle'));
  toast.addEventListener('close', () => console.log('close'));
  toast.addEventListener('open', () => console.log('open'));
</script>
  `
};

/**
 * @summary Toast positioning options relative to screen edges or anchor elements. Position toasts in consistent locations where they won't obscure important content, typically bottom-center or top-right for global feedback.
 * @tags test-case
 */
export const Position = {
  render: () => html`
<nve-toast anchor="btn" position="top">top</nve-toast>
<nve-toast anchor="btn" position="right">right</nve-toast>
<nve-toast anchor="btn" position="bottom">bottom</nve-toast>
<nve-toast anchor="btn" position="left">left</nve-toast>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @summary Fine-grained toast alignment for precise placement control. Use alignment to position toasts relative to anchor edges, useful for contextual feedback that should appear near specific UI elements.
 * @tags test-case
 */
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

/* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */

/**
 * @summary Legacy behavior-trigger pattern for automatic toast lifecycle management. Deprecated approach with manual trigger attributes, prefer modern popovertarget API for simpler toast implementation and better maintainability.
 * @tags test-case
 * @deprecated
 */
export const LegacyBehaviorTrigger = {
  render: () => html`
<div nve-layout="row align:center" style="height: 90vh">
  <nve-button id="btn">copy to clipboard</nve-button>
  <nve-toast trigger="btn" behavior-trigger position="top" close-timeout="1500" hidden>copied!</nve-toast>
</div>
`
};

/**
 * @summary Toast functionality within shadow DOM for Web Component architectures. Proper toast positioning and behavior in encapsulated component environments, essential for component library implementations.
 * @tags test-case
 */
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

/**
 * @summary Body anchor positioning for toast.
 * @tags test-case
 */
export const BodyAnchor = {
  render: () => html`
<nve-toast style="--background: red" anchor="body" position="center" alignment="center">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: blue" anchor="body" position="top" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: yellow" anchor="body" position="top">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: green" anchor="body" position="top" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: purple" anchor="body" position="bottom" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: orange" anchor="body" position="bottom">•︎︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: pink" anchor="body" position="bottom" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: brown; margin-right: -250px" anchor="body" position="left" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: gray;" anchor="body" position="left">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: black; margin-right: -250px" anchor="body" position="left" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: red; margin-left: -250px" anchor="body" position="right" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: blue" anchor="body" position="right">•︎•︎•︎•︎•︎•︎</nve-toast>
<nve-toast style="--background: yellow; margin-left: -250px" anchor="body" position="right" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
  `
};
