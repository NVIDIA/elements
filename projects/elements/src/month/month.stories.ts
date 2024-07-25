import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/month/define.js';

export default {
  title: 'Elements/Month/Examples',
  component: 'mlv-month',
};

export const Month = {
  render: () => html`
<mlv-month>
  <label>label</label>
  <input type="month" />
  <mlv-control-message>message</mlv-control-message>
</mlv-month>
`
};

export const Datalist = {
  render: () => html`
<mlv-month>
  <label>label</label>
  <input type="month" />
  <mlv-control-message>message</mlv-control-message>
  <datalist>
    <option value="2018-04"></option>
    <option value="2018-05"></option>
    <option value="2018-06"></option>
  </datalist>
</mlv-month>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg">
  <mlv-month>
    <label>label</label>
    <input type="month" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-month>

  <mlv-month>
    <label>disabled</label>
    <input type="month" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-month>

  <mlv-month>
    <label>success</label>
    <input type="month" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-month>

  <mlv-month>
    <label>error</label>
    <input type="month" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-month>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg">
  <mlv-month layout="horizontal">
    <label>label</label>
    <input type="month" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-month>

  <mlv-month layout="horizontal">
    <label>disabled</label>
    <input type="month" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-month>

  <mlv-month layout="horizontal">
    <label>success</label>
    <input type="month" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-month>

  <mlv-month layout="horizontal">
    <label>error</label>
    <input type="month" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-month>
</div>`
};
