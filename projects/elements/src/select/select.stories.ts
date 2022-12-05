import { html } from 'lit';
import '@elements/elements/select/define.js';

export default {
  title: 'Elements/Select/Examples',
  component: 'nve-select',
  parameters: { badges: ['beta'] }
};

export const Select = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const Prefix = {
  render: () => html`
<div nve-layout="grid span-items:6 gap:md">
  <nve-select>
    <nve-button interaction="ghost" readonly="">location</nve-button>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
  </nve-select>
  <nve-input>
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>
</div>`
};

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="success">message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="error">message</nve-control-message>
  </nve-select>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="success">message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="error">message</nve-control-message>
  </nve-select>
</div>`
};

export const Multiple = {
  render: () => html`
<div nve-layout="column gap:xl">
  <nve-select>
    <label>label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
  <hr />
  <nve-select layout="horizontal">
    <label>label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

export const Size = {
  render: () => html`
<div nve-layout="column gap:xl">
  <nve-select>
    <label>label</label>
    <select size="3">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
  <hr />
  <nve-select layout="horizontal">
    <label>label</label>
    <select size="3">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};