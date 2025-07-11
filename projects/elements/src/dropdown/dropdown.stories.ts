import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/select/define.js';

export default {
  title: 'Elements/Dropdown',
  component: 'nve-dropdown',
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  render: () => html`
<nve-dropdown id="dropdown">dropdown content</nve-dropdown>
<nve-button popovertarget="dropdown">button</nve-button>
  `
};

export const NestedMenus = {
  render: () => html`
<style>
  nve-dropdown + nve-dropdown {
    --nve-sys-layer-popover-offset: 14px;
  }
</style>

<nve-button popovertarget="menu-1">menu</nve-button>

<!-- experimental demo, not stable! -->
<section id="dropdown-group">
  <nve-dropdown popover-type="manual" id="menu-1">
    <nve-menu>
      <nve-menu-item popovertarget="menu-2">item 1-1 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon></nve-menu-item>
      <nve-menu-item>item 1-2</nve-menu-item>
      <nve-menu-item>item 1-3</nve-menu-item>
    </nve-menu>
  </nve-dropdown>

  <nve-dropdown popover-type="manual" id="menu-2" position="right" alignment="start">
    <nve-menu>
      <nve-menu-item>item 2-1</nve-menu-item>
      <nve-menu-item popovertarget="menu-3">item 2-2 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon></nve-menu-item>
      <nve-menu-item>item 2-3</nve-menu-item>
    </nve-menu>
  </nve-dropdown>

  <nve-dropdown popover-type="manual" id="menu-3" position="right" alignment="start">
    <nve-menu>
      <nve-menu-item>item 3-1</nve-menu-item>
      <nve-menu-item>item 3-2</nve-menu-item>
      <nve-menu-item>item 3-3</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
</section>

<script type="module">
  const group = document.querySelector('#dropdown-group');

  globalThis.document.addEventListener('pointerup', (e) => {
    if (Array.from(group.querySelectorAll('nve-dropdown')).every(dropdown => clickOutsideElementBounds(e, dropdown))) {
      group.querySelectorAll('nve-dropdown').forEach(d => d.hidePopover());
    }
  });

  function clickOutsideElementBounds(event, element) {
    const { left, right, top, bottom } = element.getBoundingClientRect();
    return event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;
  }
</script>
  `
};

export const Visual = {
  render: () => html`
<nve-dropdown anchor="btn">dropdown content</nve-dropdown>
<nve-button id="btn">button</nve-button>
  `
};

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

export const Closable = {
  render: () => html`
<nve-dropdown anchor="btn" closable>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content in a closable dropdown</p>
</nve-dropdown>
<nve-button id="btn">button</nve-button>
  `
};

export const Content = {
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

export const DynamicTrigger = {
  render: () => html`
<div id="dynamic-trigger-demo" nve-layout="row align:center" style="height: 250px">
  <nve-dropdown behavior-trigger hidden>hello there</nve-dropdown>
  <nve-button>button</nve-button>
  <nve-button>button</nve-button>
  <nve-button>button</nve-button>
  <script type="module">
    const dropdown = document.querySelector('#dynamic-trigger-demo nve-dropdown');
    document.querySelector('#dynamic-trigger-demo').addEventListener('mousedown', e => {
      if (e.target.tagName === 'NVE-BUTTON') {
        dropdown.anchor = e.target;
        dropdown.trigger = e.target;
      }
    });
  </script>
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

export const NestedDropdownShadowRoots = {
  render: () => html`
<nve-button popovertarget="dropdown">open</nve-button>
<nve-dropdown id="dropdown">
  <nve-select style="--width: 300px">
    <label>label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3" selected>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</nve-dropdown>
  `
};

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
<nve-dropdown id="dropdown" closable>
  dropdown content
  <button>btn</button>
</nve-dropdown>

<nve-tooltip id="tooltip" hidden behavior-trigger trigger="btn">dropdown content</nve-tooltip>

<nve-icon-button id="btn" popovertarget="dropdown" icon-name="gear" aria-label="settings"></nve-icon-button>
  `
};

export const DropdownHintTriggers = {
  render: () => html`
<nve-tooltip id="tooltip" hidden behavior-trigger trigger="btn">dropdown content</nve-tooltip>

<nve-dropdown id="dropdown" hidden behavior-trigger trigger="btn" closable>
  dropdown content
  <button>btn</button>
</nve-dropdown>

<nve-icon-button id="btn" icon-name="gear" aria-label="settings"></nve-icon-button>
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

<nve-dropdown id="dropdown" anchor="btn" position="bottom" alignment="center">
  dropdown content
</nve-dropdown>

<nve-dropdown id="dropdown" anchor="btn" position="right" alignment="center">
  dropdown content
</nve-dropdown>

<nve-icon-button id="btn" icon-name="gear" aria-label="settings"></nve-icon-button>
  `
};