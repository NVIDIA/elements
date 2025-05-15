import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/password/define.js';

export default {
  title: 'Elements/Password',
  component: 'nve-password',
};

export const Default = {
  render: () => html`
<nve-password>
  <label>label</label>
  <input type="password" value="123456" />
  <nve-control-message>message</nve-control-message>
</nve-password>`
};

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-password>
    <label>label</label>
    <input type="password" value="123456" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password>
    <label>disabled</label>
    <input type="password" value="123456" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password>
    <label>success</label>
    <input type="password" value="123456" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-password>

  <nve-password>
    <label>error</label>
    <input type="password" value="123456" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-password>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-password layout="horizontal">
    <label>label</label>
    <input type="password" value="123456" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>disabled</label>
    <input type="password" value="123456" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>success</label>
    <input type="password" value="123456" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>error</label>
    <input type="password" value="123456" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-password>
</div>`
};
