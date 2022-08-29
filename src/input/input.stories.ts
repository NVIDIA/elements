import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Forms/Input/Examples',
  component: 'nve-input',
  parameters: { badges: ['beta'] }
};

export const Input = () => {
  return html`
<nve-input>
  <label>label</label>
  <input type="text" required />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg">
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
<div nve-layout="column gap:lg align:stretch">
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

export const controlValidation = () => {
  return html`
<nve-input>
  <label>validation</label>
  <input required />
  <nve-control-message>message</nve-control-message>
  <nve-control-message error="valueMissing">required</nve-control-message>
</nve-input>`;
}
