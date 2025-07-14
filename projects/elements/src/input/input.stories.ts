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