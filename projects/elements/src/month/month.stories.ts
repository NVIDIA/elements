import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/month/define.js';

export default {
  title: 'Elements/Month',
  component: 'nve-month',
};

export const Default = {
  render: () => html`
<nve-month>
  <label>label</label>
  <input type="month" />
  <nve-control-message>message</nve-control-message>
</nve-month>
`
};

export const Datalist = {
  render: () => html`
<nve-month>
  <label>label</label>
  <input type="month" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="2018-04"></option>
    <option value="2018-05"></option>
    <option value="2018-06"></option>
  </datalist>
</nve-month>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-month>
    <label>label</label>
    <input type="month" />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month>
    <label>disabled</label>
    <input type="month" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month>
    <label>success</label>
    <input type="month" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-month>

  <nve-month>
    <label>error</label>
    <input type="month" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-month>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-month layout="horizontal">
    <label>label</label>
    <input type="month" />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>disabled</label>
    <input type="month" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>success</label>
    <input type="month" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>error</label>
    <input type="month" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-month>
</div>`
};
