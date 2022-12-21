import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/month/define.js';
import '@elements/elements/datetime/define.js';

export default {
  title: 'Elements/Datetime/Examples',
  component: 'mlv-datetime',
  parameters: { badges: ['alpha'] }
};

export const Datetime = {
  render: () => html`
<mlv-datetime>
  <label>date</label>
  <input type="datetime-local" />
  <mlv-control-message>message</mlv-control-message>
</mlv-datetime>
`
};

export const Datalist = {
  render: () => html`
<mlv-month>
  <label>label</label>
  <input type="datetime-local" />
  <mlv-control-message>message</mlv-control-message>
  <datalist>
    <option value="2018-06-07T00:00"></option>
    <option value="2018-06-12T19:30"></option>
    <option value="2018-06-14T00:00"></option>
  </datalist>
</mlv-month>
  `
}

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-datetime>
    <label>label</label>
    <input type="datetime-local" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-datetime>

  <mlv-datetime>
    <label>disabled</label>
    <input type="datetime-local" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-datetime>

  <mlv-datetime>
    <label>success</label>
    <input type="datetime-local" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-datetime>

  <mlv-datetime>
    <label>error</label>
    <input type="datetime-local" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-datetime>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-datetime layout="horizontal">
    <label>label</label>
    <input type="datetime-local" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-datetime>

  <mlv-datetime layout="horizontal">
    <label>disabled</label>
    <input type="datetime-local" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-datetime>

  <mlv-datetime layout="horizontal">
    <label>success</label>
    <input type="datetime-local" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-datetime>

  <mlv-datetime layout="horizontal">
    <label>error</label>
    <input type="datetime-local" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-datetime>
</div>`
};
