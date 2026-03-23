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

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

/**
 * @summary Basic toggletip requiring click to open and close. Unlike tooltips that appear on hover, use toggletips for interactive content, extra details, or when users need time to read or interact with the popover content.
 */
export const Default = {
  render: () => html`
<nve-toggletip id="toggletip">hello there</nve-toggletip>
<nve-button popovertarget="toggletip">button</nve-button>
`
};

/**
 * @summary Visual example using anchor attribute for explicit trigger-target relationship and consistent toggletip implementation across your application.
 * @tags test-case
 */
export const Visual = {
  render: () => html`
<nve-toggletip anchor="toggletip-btn">hello there</nve-toggletip>
<nve-button id="toggletip-btn">button</nve-button>
`
};

/**
 * @summary Toggletip with complete structure including header, content, and footer sections. Perfect for rich interactive content like quick forms, action menus, or detailed explanations that gain from organized layout.
 */
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

/**
 * @summary Toggletip with footer for action buttons or supplementary links. Use when toggletip content needs follow-up actions, navigation, or extra context links without requiring a header section.
 */
export const ContentWithFooter = {
  render: () => html`
<nve-toggletip anchor="btn">
    <p nve-text="body">some text content in a toggletip</p>
  <nve-toggletip-footer>
    <p nve-text="body">Toggletip Footer</p>
  </nve-toggletip-footer>
</nve-toggletip>

<nve-button id="btn">button</nve-button>
`
};

/**
 * @summary Toggletip with header for titled content sections. Use when toggletip information benefits from a clear title or heading to establish context, improving content scannability and understanding.
 * @tags test-case
 */
export const ContentWithHeader = {
  render: () => html`
<nve-toggletip anchor="btn">
  <nve-toggletip-header>
    <h3 nve-text="heading sm">Toggletip Header</h3>
  </nve-toggletip-header>
    <p nve-text="body">some text content in a toggletip</p>
</nve-toggletip>

<nve-button id="btn">button</nve-button>
`
};

/**
 * @summary Event handling for toggletip lifecycle events. Useful for adding custom behavior when toggletip state changes.
 */
export const Events = {
  render: () => html`
<nve-toggletip id="toggletip">hello there</nve-toggletip>
<nve-button popovertarget="toggletip">button</nve-button>
<script type="module">
  const toggletip = document.querySelector('nve-toggletip');
  toggletip.addEventListener('beforetoggle', () => console.log('beforetoggle'));
  toggletip.addEventListener('toggle', () => console.log('toggle'));
  toggletip.addEventListener('close', () => console.log('close'));
  toggletip.addEventListener('open', () => console.log('open'));
</script>
  `
};

/**
 * @summary Closable toggletip with explicit close button for user control. Use when content is complex enough that users may want to dismiss it independently of clicking outside, providing clear exit paths for longer-form content.
 * @tags test-case
 */
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

/**
 * @summary Toggletip with alert header for error states or critical messaging. Perfect for displaying error details with recovery actions, combining status communication with actionable next steps in a compact format.
 * @tags test-case
 */
export const AlertGroup = {
  inline: false,
  render: () => html`
<nve-toggletip id="toggletip-alert-group">
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
<nve-button popovertarget="toggletip-alert-group">button</nve-button>
  `
};

/**
 * @summary Toggletip positioning options relative to trigger element. Choose position based on available screen space and content type, ensuring toggletips remain visible and don't extend beyond viewport boundaries.
 * @tags test-case
 */
export const Position = {
  render: () => html`
<nve-toggletip anchor="btn" position="top">top</nve-toggletip>
<nve-toggletip anchor="btn" position="right">right</nve-toggletip>
<nve-toggletip anchor="btn" position="bottom">bottom</nve-toggletip>
<nve-toggletip anchor="btn" position="left">left</nve-toggletip>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @summary Precise toggletip alignment combined with positioning for optimal placement control. Use alignment to fine-tune toggletip placement relative to trigger edges, improving visual flow and reducing content overlap in dense layouts.
 * @tags test-case
 */
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

/**
 * @summary Toggletip anchored to elements across shadow DOM boundaries.
 * @tags test-case
 */
export const CrossShadowRootAnchorPosition = {
  render: () => html`
<nve-button popovertarget="root-toggletip">document root anchor</nve-button>
<nve-toggletip id="root-toggletip">document root toggletip</nve-toggletip>

<demo-shadow-root style="visibility: visible !important;">
  <template shadowrootmode="open">
    <nve-toggletip id="cross-root-toggletip" hidden>cross root toggletip</nve-toggletip>
    <slot></slot>
  </template>
</demo-shadow-root>
<nve-button popovertarget="cross-root-toggletip">cross root anchor</nve-button>
  `
};

/**
 * @summary Legacy behavior-trigger pattern for automatic toggletip lifecycle management. Deprecated approach with manual trigger attributes, prefer modern popovertarget API for simpler and more maintainable toggletip implementation.
 * @tags test-case
 * @deprecated
 */
export const LegacyBehaviorTrigger = {
  render: () => html`
<nve-toggletip behavior-trigger anchor="action-btn" trigger="action-btn" hidden>hello there</nve-toggletip>
<nve-button id="action-btn">button</nve-button>
  `
};
