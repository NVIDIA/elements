import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/week/define.js';

export default {
  title: 'Elements/Week/Examples',
  component: 'nve-week',
};

export const Default = {
  render: () => html`
<nve-week>
  <label>label</label>
  <input type="week" />
  <nve-control-message>message</nve-control-message>
</nve-week>
`
};

export const Datalist = {
  render: () => html`
<nve-week>
  <label>label</label>
  <input type="week" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="2018-W25"></option>
    <option value="2018-W26"></option>
    <option value="2018-W27"></option>
  </datalist>
</nve-week>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-week>
    <label>label</label>
    <input type="week" />
    <nve-control-message>message</nve-control-message>
  </nve-week>

  <nve-week>
    <label>disabled</label>
    <input type="week" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-week>

  <nve-week>
    <label>success</label>
    <input type="week" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-week>

  <nve-week>
    <label>error</label>
    <input type="week" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-week>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-week layout="horizontal">
    <label>label</label>
    <input type="week" />
    <nve-control-message>message</nve-control-message>
  </nve-week>

  <nve-week layout="horizontal">
    <label>disabled</label>
    <input type="week" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-week>

  <nve-week layout="horizontal">
    <label>success</label>
    <input type="week" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-week>

  <nve-week layout="horizontal">
    <label>error</label>
    <input type="week" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-week>
</div>`
};
