import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/tooltip/define.js';

export default {
  title: 'Elements/Dropdown',
  component: 'nve-dropdown'
};

/**
 * @description Basic dropdown implementation using popovertarget attribute to connect trigger and dropdown. Useful for simple dropdown menus.
 */
export const Default = {
  render: () => html`
<nve-dropdown id="dropdown">dropdown content</nve-dropdown>
<nve-button popovertarget="dropdown">button</nve-button>
  `
};

/**
 * @description An example of a dropdown menu. Useful for navigation menus, context menus, settings and user actions.
 */
export const DropdownMenu = {
  render: () => html`
  <nve-button popovertarget="dropdown-menu">dropdown</nve-button>
  <nve-dropdown id="dropdown-menu">
    <nve-menu>
      <nve-menu-item><nve-icon name="person"></nve-icon> profile</nve-menu-item>
      <nve-menu-item><nve-icon name="gear"></nve-icon> settings</nve-menu-item>
      <nve-menu-item><nve-icon name="star"></nve-icon> favorites</nve-menu-item>
      <nve-divider></nve-divider>
      <nve-menu-item><nve-icon name="logout"></nve-icon> logout</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  `
};

/**
 * @description Dropdown using anchor attribute to reference trigger element by ID. Alternative approach for connecting dropdowns to their triggers.
 */
export const Visual = {
  render: () => html`
<nve-dropdown anchor="btn">dropdown content</nve-dropdown>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @description Demonstrates event handling for dropdown open and close events. Useful for adding custom behavior when dropdown state changes.
 */
export const Events = {
  inline: false,
  render: () => html`
<nve-dropdown id="dropdown">dropdown content</nve-dropdown>
<nve-button popovertarget="dropdown">button</nve-button>
<script type="module">
  const dropdown = document.querySelector('nve-dropdown');
  dropdown.addEventListener('open', () => console.log('open'));
  dropdown.addEventListener('close', () => console.log('close'));
</script>
  `
};

/**
 * @description Dropdown with closable attribute that allows users to dismiss the dropdown by clicking close button.
 */
export const Closable = {
  render: () => html`
<nve-dropdown anchor="btn" closable>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content in a closable dropdown</p>
</nve-dropdown>
<nve-button id="btn">button</nve-button>
  `
};

/**
 * @description Dropdown with structured content using header and footer sections. Perfect for complex dropdown content that needs clear visual hierarchy.
 */
export const DropdownLayout = {
  render: () => html`
<nve-dropdown anchor="btn">
  <nve-dropdown-header>
    <h3 nve-text="heading semibold sm">heading</h3>
  </nve-dropdown-header>
  <p nve-text="body">some text content in a closable dropdown</p>
  <nve-dropdown-footer>
    <p nve-text="body">footer</p>
  </nve-dropdown-footer>
</nve-dropdown>
<nve-button id="btn">button</nve-button>
  `
};

export const MultipleTriggers = {
  render: () => html`
<div nve-layout="row gap:sm align:center">
  <nve-button popovertarget="dropdown">button</nve-button>
  <nve-button popovertarget="dropdown">button</nve-button>
  <nve-button popovertarget="dropdown">button</nve-button>
  <nve-dropdown id="dropdown">hello there</nve-dropdown>
</div>
  `
};

export const Position = {
  render: () => html`
<nve-dropdown anchor="card" position="top" alignment="center">
  <h3 nve-text="label">Top</h3>
  <p nve-text="body">dropdown positioned top</p>
</nve-dropdown>
<nve-dropdown anchor="card" position="right" alignment="center">
  <h3 nve-text="label">Right</h3>
  <p nve-text="body">dropdown positioned right</p>
</nve-dropdown>
<nve-dropdown anchor="card" position="bottom" alignment="center">
  <h3 nve-text="label">Bottom</h3>
  <p nve-text="body">dropdown positioned bottom</p>
</nve-dropdown>
<nve-dropdown anchor="card" position="left" alignment="center">
  <h3 nve-text="label">Left</h3>
  <p nve-text="body">dropdown positioned left</p>
</nve-dropdown>
<nve-card id="card" style="width: 250px; height: 200px;"></nve-card>
  `
};

export const Alignment = {
  render: () => html`
<div nve-theme nve-layout="row align:center">
  <nve-dropdown open anchor="card" position="top" alignment="start">top start</nve-dropdown>
  <nve-dropdown open anchor="card" position="top" alignment="center">top center</nve-dropdown>
  <nve-dropdown open anchor="card" position="top" alignment="end">top end</nve-dropdown>

  <nve-dropdown open anchor="card" position="right" alignment="start">right start</nve-dropdown>
  <nve-dropdown open anchor="card" position="right" alignment="center">right center</nve-dropdown>
  <nve-dropdown open anchor="card" position="right" alignment="end">right end</nve-dropdown>

  <nve-dropdown open anchor="card" position="bottom" alignment="start">bottom start</nve-dropdown>
  <nve-dropdown open anchor="card" position="bottom" alignment="center">bottom center</nve-dropdown>
  <nve-dropdown open anchor="card" position="bottom" alignment="end">bottom end</nve-dropdown>

  <nve-dropdown open anchor="card" position="left" alignment="start">left start</nve-dropdown>
  <nve-dropdown open anchor="card" position="left" alignment="center">left center</nve-dropdown>
  <nve-dropdown open anchor="card" position="left" alignment="end">left end</nve-dropdown>

  <nve-card id="card" style="width: 450px; height: 300px; margin-top: 50px;"></nve-card>
</div>
  `
};

/**
 * @description Dropdown containing a radio group for single-selection options. Perfect for sort controls, filter selections, or preference settings.
 */
export const RadioGroup = {
  render: () => html`
<nve-dropdown anchor="btn">
  <nve-radio-group style="width: 250px">
    <label>Sort By</label>
    <nve-radio>
      <label>Completed</label>
      <input type="radio" checked />
      <nve-control-message>latest completed tasks</nve-control-message>
    </nve-radio>
    <nve-radio>
      <label>Failing</label>
      <input type="radio" />
      <nve-control-message>latest failing tasks</nve-control-message>
    </nve-radio>
    <nve-radio>
      <label>Status</label>
      <input type="radio" />
      <nve-control-message>task status priority</nve-control-message>
    </nve-radio>
  </nve-radio-group>
</nve-dropdown>
<nve-button id="btn" nve-control>completed <nve-icon name="caret" direction="down" size="sm"></nve-icon></nve-button>
  `
};

/**
 * @description Dropdown containing a checkbox group for multi-selection options. Ideal for filter controls, feature toggles, or bulk action selections.
 */
export const CheckboxGroup = {
  render: () => html`
<nve-dropdown anchor="btn">
  <nve-checkbox-group style="width: 250px">
    <label>Test Suites</label>
    <nve-checkbox>
      <label>Local</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-checkbox>
      <label>Nightly</label>
      <input type="checkbox" checked />
    </nve-checkbox>
    <nve-checkbox>
      <label>Remote</label>
      <input type="checkbox" />
    </nve-checkbox>
  </nve-checkbox-group>
</nve-dropdown>
<nve-button id="btn" nve-control>test suites <nve-icon name="caret" direction="down" size="sm"></nve-icon></nve-button>
  `
};

export const LegacyBehaviorTrigger = {
  inline: false,
  render: () => html`
<nve-button id="dropdown-btn">open</nve-button>
<nve-dropdown anchor="dropdown-btn" trigger="dropdown-btn" behavior-trigger hidden>
  <p nve-text="body">hello there</p>
</nve-dropdown>
  `
};

export const DropdownHint = {
  render: () => html`
<nve-dropdown id="dropdown">
  dropdown content
</nve-dropdown>

<nve-tooltip id="tooltip" hidden behavior-trigger trigger="btn">dropdown content</nve-tooltip>

<nve-icon-button id="btn" popovertarget="dropdown" icon-name="gear" aria-label="settings"></nve-icon-button>
  `
};

export const DropdownPositionFallback = {
  render: () => html`
<style>
  body {
    align-items: start !important;
    margin: 0;
    padding: 0 !important;
  }
</style>

<nve-dropdown anchor="btn" position="bottom" alignment="center">
  dropdown content
</nve-dropdown>

<nve-dropdown anchor="btn" position="right" alignment="center">
  dropdown content
</nve-dropdown>

<nve-icon-button id="btn" icon-name="gear" aria-label="settings"></nve-icon-button>
  `
};