import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/time/define.js';

export default {
  title: 'Elements/Time/Examples',
  component: 'nve-time',
};

export const Default = {
  render: () => html`
<nve-time>
  <label>label</label>
  <input type="time" min="09:00" max="18:00" value="12:00" />
  <nve-control-message>message</nve-control-message>
</nve-time>`
};

export const Datalist = {
  render: () => html`
<nve-time>
  <label>label</label>
  <input type="time" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="12:00"></option>
    <option value="13:00"></option>
    <option value="14:00"></option>
  </datalist>
</nve-time>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-time>
    <label>label</label>
    <input type="time" />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time>
    <label>disabled</label>
    <input type="time" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time>
    <label>success</label>
    <input type="time" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-time>

  <nve-time>
    <label>error</label>
    <input type="time" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-time>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-time layout="horizontal">
    <label>label</label>
    <input type="time" />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>disabled</label>
    <input type="time" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>success</label>
    <input type="time" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>error</label>
    <input type="time" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-time>
</div>`
};
