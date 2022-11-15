import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/card/define.js';
import '@elements/elements/dropdown/define.js';


export default {
  title: 'Elements/Dropdown/Examples',
  component: 'nve-dropdown',
  parameters: { badges: ['alpha'] },
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

type ArgTypes = Dropdown;

export const Default = {
  render: (args: ArgTypes) => html`
    <div style="height: 250px; width: 100%; display: flex; align-items:center; justify-content: center;">
      <nve-dropdown anchor="btn" ${spread(args)}>${args.textContent}</nve-dropdown>
      <nve-button id="btn">button</nve-button>
    </div>
  `,
  args: { textContent: 'hello there', position: 'bottom' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-button id="dropdown-btn">open</nve-button>
  <nve-dropdown anchor="dropdown-btn" closable hidden>
    <h3 nve-text="heading">Title</h3>
    <p nve-text="body">some text content in a dropdown</p>
  </nve-dropdown>
</div>
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
<div nve-layout="row align:center" style="height: 250px">
  <nve-dropdown anchor="btn">
    <nve-search rounded>
      <input type="search" placeholder="Search" />
    </nve-search>
    <nve-alert status="info">some text content in a dropdown</nve-alert>
  </nve-dropdown>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

export const RadioGroup = {
  render: () => html`
<div nve-layout="row align:center" style="height: 250px">
  <nve-dropdown anchor="btn">
    <nve-radio-group style="width: 250px">
      <label>Sort By</label>
      <nve-radio>
        <label>Completed</label>
        <input type="radio" />
        <nve-control-message>latest completed tasts</nve-control-message>
      </nve-radio>
      <nve-radio>
        <label>Failing</label>
        <input type="radio" checked />
        <nve-control-message>latest failing tasks</nve-control-message>
      </nve-radio>
      <nve-radio>
        <label>Status</label>
        <input type="radio" />
        <nve-control-message>task status priority</nve-control-message>
      </nve-radio>
    </nve-radio-group>
  </nve-dropdown>
  <nve-button id="btn">button</nve-button>
</div>
  `
};

export const Closable = {
  render: () => html`
<div nve-layout="row align:center" style="height: 200px">
  <nve-dropdown anchor="btn" closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a closable dropdown</p>
  </nve-dropdown>
  <nve-button id="btn">button</nve-button>
</div>
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
  <nve-dropdown anchor="card" position="top" closable>
    <h3 nve-text="label">Top</h3>
    <p nve-text="body">dropdown positioned top</p>
  </nve-dropdown>
  <nve-dropdown anchor="card" position="right" closable>
    <h3 nve-text="label">Right</h3>
    <p nve-text="body">dropdown positioned right</p>
  </nve-dropdown>
  <nve-dropdown anchor="card" position="bottom" closable>
    <h3 nve-text="label">Bottom</h3>
    <p nve-text="body">dropdown positioned bottom</p>
  </nve-dropdown>
  <nve-dropdown anchor="card" position="left" closable>
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
  <nve-dropdown anchor="card" position="top">top center</nve-dropdown>
  <nve-dropdown anchor="card" position="top" alignment="end">top end</nve-dropdown>

  <nve-dropdown anchor="card" position="right" alignment="start">right start</nve-dropdown>
  <nve-dropdown anchor="card" position="right">right center</nve-dropdown>
  <nve-dropdown anchor="card" position="right" alignment="end">right end</nve-dropdown>

  <nve-dropdown anchor="card" position="bottom" alignment="start">bottom start</nve-dropdown>
  <nve-dropdown anchor="card" position="bottom">bottom center</nve-dropdown>
  <nve-dropdown anchor="card" position="bottom" alignment="end">bottom end</nve-dropdown>

  <nve-dropdown anchor="card" position="left" alignment="start">left start</nve-dropdown>
  <nve-dropdown anchor="card" position="left">left center</nve-dropdown>
  <nve-dropdown anchor="card" position="left" alignment="end">left end</nve-dropdown>

  <nve-card id="card" style="width: 450px; height: 300px;"></nve-card>
</div>
  `
};