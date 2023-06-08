import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/logo/define.js';

export default {
  title: 'Elements/Select/Examples',
  component: 'nve-select',
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

export const CustomOptionRender = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select id="complex">
    <option value="1">
      Debugger
      <template>
        <div nve-layout="row gap:xs align:vertical-center">
          <nve-logo color="pink-rose">Db</nve-logo>
          <p nve-layout="column gap:xs">
            <span nve-text="label">Debugger</span>
            <span nve-text="body muted">some details on option 1</span>
          </p>
        </div>
      </template>
    </option>
    <option value="2">
      Task Manager
      <template>
        <div nve-layout="row gap:xs align:vertical-center">
          <nve-logo color="blue-cobalt">TM</nve-logo>
          <p nve-layout="column gap:xs">
            <span nve-text="label">Task Manager</span>
            <span nve-text="body muted">some details on option 2</span>
          </p>
        </div>
      </template>
    </option>
    <option value="3">
      CI Services
      <template>
        <div nve-layout="row gap:xs align:vertical-center">
          <nve-logo color="green-mint">CI</nve-logo>
          <p nve-layout="column gap:xs">
            <span nve-text="label">CI Services</span>
            <span nve-text="body muted">some details on option 3</span>
          </p>
        </div>
      </template>
    </option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>
  `
}

export const Prefix = {
  render: () => html`
  <nve-select>
    <nve-button interaction="ghost" readonly>location</nve-button>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
  </nve-select>
  `
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