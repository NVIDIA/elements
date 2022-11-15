import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/card/define.js';
import '@elements/elements/dropdown/define.js';


export default {
  title: 'Elements/Dropdown/Examples',
  component: 'mlv-dropdown',
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
      <mlv-dropdown anchor="btn" ${spread(args)}>${args.textContent}</mlv-dropdown>
      <mlv-button id="btn">button</mlv-button>
    </div>
  `,
  args: { textContent: 'hello there', position: 'bottom' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<div mlv-layout="row align:center" style="height: 250px">
  <mlv-button id="dropdown-btn">open</mlv-button>
  <mlv-dropdown anchor="dropdown-btn" closable hidden>
    <h3 mlv-text="heading">Title</h3>
    <p mlv-text="body">some text content in a dropdown</p>
  </mlv-dropdown>
</div>
<script>
  const dropdown = document.querySelector('mlv-dropdown');
  const btn = document.querySelector('#dropdown-btn');
  btn.addEventListener('click', () => dropdown.hidden = false);
  dropdown.addEventListener('close', () => dropdown.hidden = true);
</script>
  `
};

export const Content = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 250px">
  <mlv-dropdown anchor="btn">
    <mlv-search rounded>
      <input type="search" placeholder="Search" />
    </mlv-search>
    <mlv-alert status="info">some text content in a dropdown</mlv-alert>
  </mlv-dropdown>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const RadioGroup = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 250px">
  <mlv-dropdown anchor="btn">
    <mlv-radio-group style="width: 250px">
      <label>Sort By</label>
      <mlv-radio>
        <label>Completed</label>
        <input type="radio" />
        <mlv-control-message>latest completed tasts</mlv-control-message>
      </mlv-radio>
      <mlv-radio>
        <label>Failing</label>
        <input type="radio" checked />
        <mlv-control-message>latest failing tasks</mlv-control-message>
      </mlv-radio>
      <mlv-radio>
        <label>Status</label>
        <input type="radio" />
        <mlv-control-message>task status priority</mlv-control-message>
      </mlv-radio>
    </mlv-radio-group>
  </mlv-dropdown>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const Closable = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 200px">
  <mlv-dropdown anchor="btn" closable>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a closable dropdown</p>
  </mlv-dropdown>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const Arrow = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 200px">
  <mlv-dropdown anchor="btn" arrow>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a closable dropdown</p>
  </mlv-dropdown>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const Position = {
  render: () => html`
<div mlv-theme mlv-layout="row align:center" style="width: 100%; height: 400px;">
  <mlv-dropdown anchor="card" position="top" closable>
    <h3 mlv-text="label">Top</h3>
    <p mlv-text="body">dropdown positioned top</p>
  </mlv-dropdown>
  <mlv-dropdown anchor="card" position="right" closable>
    <h3 mlv-text="label">Right</h3>
    <p mlv-text="body">dropdown positioned right</p>
  </mlv-dropdown>
  <mlv-dropdown anchor="card" position="bottom" closable>
    <h3 mlv-text="label">Bottom</h3>
    <p mlv-text="body">dropdown positioned bottom</p>
  </mlv-dropdown>
  <mlv-dropdown anchor="card" position="left" closable>
    <h3 mlv-text="label">Left</h3>
    <p mlv-text="body">dropdown positioned left</p>
  </mlv-dropdown>
  <mlv-card id="card" style="width: 250px; height: 200px;"></mlv-card>
</div>
  `
};

export const Alignment = {
  render: () => html`
<div mlv-theme mlv-layout="row align:center">
  <mlv-dropdown anchor="card" position="top" alignment="start">top start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="top">top center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="top" alignment="end">top end</mlv-dropdown>

  <mlv-dropdown anchor="card" position="right" alignment="start">right start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="right">right center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="right" alignment="end">right end</mlv-dropdown>

  <mlv-dropdown anchor="card" position="bottom" alignment="start">bottom start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="bottom">bottom center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="bottom" alignment="end">bottom end</mlv-dropdown>

  <mlv-dropdown anchor="card" position="left" alignment="start">left start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="left">left center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="left" alignment="end">left end</mlv-dropdown>

  <mlv-card id="card" style="width: 450px; height: 300px;"></mlv-card>
</div>
  `
};