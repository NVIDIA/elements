import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import { spread } from '@elements/elements/internal';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/alert/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/radio/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/icon/define.js';

export default {
  title: 'Elements/Dropdown/Examples',
  component: 'nve-dropdown',
  parameters: {
    badges: ['alpha'],
    docs: {
      inlineStories: false,
      iframeHeight: 500
    },
  },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left']
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      defaultValue: 'start'
    }
  }
};

type ArgTypes = Dropdown;

export const Default = {
  render: (args: ArgTypes) => html`
    <div style="height: 250px; width: 100%; display: flex; align-items:center; justify-content: center;">
      <nve-dropdown anchor="btn" ${spread(args)}><p nve-text="body">${args.textContent}</p></nve-dropdown>
      <nve-button id="btn">button</nve-button>
    </div>
  `,
  args: { textContent: 'hello there', position: 'bottom' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<nve-button id="dropdown-btn">open</nve-button>
<nve-dropdown anchor="dropdown-btn" hidden>
  <p nve-text="body">hello there</p>
</nve-dropdown>
<script>
  const dropdown = document.querySelector('nve-dropdown');
  const btn = document.querySelector('#dropdown-btn');
  btn.addEventListener('click', () => dropdown.hidden = false);
  dropdown.addEventListener('close', () => dropdown.hidden = true);
</script>
  `
};

export const Content = {
  render: () => html`
<nve-dropdown anchor="btn">
  <nve-search rounded>
    <input type="search" placeholder="Search" />
  </nve-search>
  <nve-alert>some text content in a dropdown</nve-alert>
</nve-dropdown>
<nve-button id="btn">button</nve-button>
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
      <nve-control-message>latest completed tasts</nve-control-message>
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
<nve-button id="btn" nve-control>completed <nve-icon name="chevron-down"></nve-icon></nve-button>
  `
};

const options = [
  { id: '1', label: 'completed', message: 'latest completed tasts' },
  { id: '2', label: 'failing', message: 'latest failing tasks' },
  { id: '3', label: 'status', message: 'task status priority' }
];

@customElement('radio-group-interactive-demo')
class RadioGroupInteractiveDemo extends LitElement {  
  @state() show = false;
  @state() selected = options[0];

  render() {
    return html`
<nve-button id="btn" style="width: 130px" nve-control>${this.selected.label} <nve-icon name="chevron-down"></nve-icon></nve-button>
<nve-dropdown anchor="btn" trigger="btn" .hidden=${!this.show} @open=${() => this.show = true} @close=${() => this.show = false}>
  <nve-radio-group style="width: 250px">
    <label>Sort By</label>
    ${options.map(option => html`
    <nve-radio @pointerup=${() => this.show = false}>
      <label>${option.label}</label>
      <input type="radio" value=${option.id} ?checked=${option.id === this.selected.id} @input=${() => this.selected = option} />
      <nve-control-message>${option.message}</nve-control-message>
    </nve-radio>`)}
  </nve-radio-group>
</nve-dropdown>
    `
  }
}

export function RadioGroupInteractive() {
  return html`<radio-group-interactive-demo></radio-group-interactive-demo>`
}

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
<nve-button id="btn" nve-control>test suites <nve-icon name="chevron-down"></nve-icon></nve-button>
  `
};

const checkboxes = [
  { id: '1', label: 'local', message: 'latest local' },
  { id: '2', label: 'nightly', message: 'latest nightly builds' },
  { id: '3', label: 'remote', message: 'pending remote builds' }
];

@customElement('checkbox-group-interactive-demo')
class CheckboxGroupInteractiveDemo extends LitElement {  
  @state() show = false;
  @state() suites = { '1': true, '2': false, '3': false };

  render() {
    return html`
<nve-button id="btn" style="width: 130px" nve-control>test suites <nve-icon name="chevron-down"></nve-icon></nve-button>
<nve-dropdown anchor="btn" trigger="btn" .hidden=${!this.show} @open=${() => this.show = true} @close=${() => this.show = false}>
  <nve-checkbox-group style="width: 250px">
    <label>Sort By</label>
    ${checkboxes.map(checkbox => html`
    <nve-checkbox>
      <label>${checkbox.label}</label>
      <input type="checkbox" value=${checkbox.id} ?checked=${this.suites[checkbox.id]} @input=${e => this.suites = { ...this.suites, [checkbox.id]: e.target.checked }} />
      <nve-control-message>${checkbox.message}</nve-control-message>
    </nve-checkbox>`)}
  </nve-checkbox-group>
</nve-dropdown>
<pre>${checkboxes.map(c => html`${c.label}: ${this.suites[c.id]}\n`)}</pre>
    `
  }
}

export const CheckboxGroupInteractive = {
  render: () => html`<checkbox-group-interactive-demo></checkbox-group-interactive-demo>`
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

export const Arrow = {
  render: () => html`
<div nve-layout="row align:center" style="height: 200px">
  <nve-dropdown anchor="btn" arrow>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a closable dropdown</p>
  </nve-dropdown>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

export const Position = {
  render: () => html`
<div nve-theme nve-layout="row align:center" style="width: 100%; height: 400px;">
  <nve-dropdown anchor="card" position="top" alignment="center" closable>
    <h3 nve-text="label">Top</h3>
    <p nve-text="body">dropdown positioned top</p>
  </nve-dropdown>
  <nve-dropdown anchor="card" position="right" alignment="center" closable>
    <h3 nve-text="label">Right</h3>
    <p nve-text="body">dropdown positioned right</p>
  </nve-dropdown>
  <nve-dropdown anchor="card" position="bottom" alignment="center" closable>
    <h3 nve-text="label">Bottom</h3>
    <p nve-text="body">dropdown positioned bottom</p>
  </nve-dropdown>
  <nve-dropdown anchor="card" position="left" alignment="center" closable>
    <h3 nve-text="label">Left</h3>
    <p nve-text="body">dropdown positioned left</p>
  </nve-dropdown>
  <nve-card id="card" style="width: 250px; height: 200px;"></nve-card>
</div>
  `
};

export const Alignment = {
  render: () => html`
<div nve-theme nve-layout="row align:center">
  <nve-dropdown anchor="card" position="top" alignment="start">top start</nve-dropdown>
  <nve-dropdown anchor="card" position="top" alignment="center">top center</nve-dropdown>
  <nve-dropdown anchor="card" position="top" alignment="end">top end</nve-dropdown>

  <nve-dropdown anchor="card" position="right" alignment="start">right start</nve-dropdown>
  <nve-dropdown anchor="card" position="right" alignment="center">right center</nve-dropdown>
  <nve-dropdown anchor="card" position="right" alignment="end">right end</nve-dropdown>

  <nve-dropdown anchor="card" position="bottom" alignment="start">bottom start</nve-dropdown>
  <nve-dropdown anchor="card" position="bottom" alignment="center">bottom center</nve-dropdown>
  <nve-dropdown anchor="card" position="bottom" alignment="end">bottom end</nve-dropdown>

  <nve-dropdown anchor="card" position="left" alignment="start">left start</nve-dropdown>
  <nve-dropdown anchor="card" position="left" alignment="center">left center</nve-dropdown>
  <nve-dropdown anchor="card" position="left" alignment="end">left end</nve-dropdown>

  <nve-card id="card" style="width: 450px; height: 300px;"></nve-card>
</div>
  `
};