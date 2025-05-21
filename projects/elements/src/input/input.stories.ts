import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Input',
  component: 'nve-input'
};

export const Default = {
  render: html`
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const Input = () => {
  return html`
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg full">
  <nve-input>
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-input>
</div>`
};

export const Horizontal = () => {
  return html`
<div nve-layout="column gap:lg full">
  <nve-input layout="horizontal">
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-input>
</div>`
};

export const Rounded = {
  render: () => html`
<nve-input rounded>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const FitText = {
  render: () => html`
<nve-input fit-text>
  <label>label</label>
  <input value="123456789012345678901234567890" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const FitContent = {
  render: () => html`
<nve-input fit-content>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const Flat = {
  render: () =>
    html`
<nve-input container="flat">
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`,
};

export const InputGroup = () => {
  return html`
<nve-input-group>
  <label>domain</label>
  <nve-select style="width: 130px">
    <select aria-label="protocol">
      <option>https://</option>
      <option>http://</option>
    </select>
  </nve-select>
  <nve-input>
    <input placeholder="example" type="url" aria-label="host" />
    <nve-button container="flat" readonly="">.com</nve-button>
  </nve-input>
  <nve-control-message>host: 123456</nve-control-message>
</nve-input-group>
`
};

export const FilterGroupRange = {
  render: () => html`
<div nve-layout="row align:vertical-center">
  <nve-input-group>
    <nve-select style="width:150px">
      <select aria-label="date type">
        <option value="1">recording date</option>
        <option value="2">process date</option>
      </select>
    </nve-select>
    <nve-date style="width:220px">
      <nve-button container="flat" readonly="">start</nve-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </nve-date>
    <nve-date style="width:220px">
      <nve-button container="flat" readonly="">end</nve-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </nve-date>
    <nve-icon-button aria-label="remove filter" icon-name="cancel"></nve-icon-button>
  </nve-input-group>
</div>
    `
}
