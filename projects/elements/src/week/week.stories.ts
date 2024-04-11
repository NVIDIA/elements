import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/week/define.js';

export default {
  title: 'Elements/Week/Examples',
  component: 'mlv-week',
};

export const Week = {
  render: () => html`
<mlv-week>
  <label>label</label>
  <input type="week" />
  <mlv-control-message>message</mlv-control-message>
</mlv-week>
`
};

export const Datalist = {
  render: () => html`
<mlv-week>
  <label>label</label>
  <input type="week" />
  <mlv-control-message>message</mlv-control-message>
  <datalist>
    <option value="2018-W25"></option>
    <option value="2018-W26"></option>
    <option value="2018-W27"></option>
  </datalist>
</mlv-week>
  `
}

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-week>
    <label>label</label>
    <input type="week" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-week>

  <mlv-week>
    <label>disabled</label>
    <input type="week" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-week>

  <mlv-week>
    <label>success</label>
    <input type="week" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-week>

  <mlv-week>
    <label>error</label>
    <input type="week" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-week>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-week layout="horizontal">
    <label>label</label>
    <input type="week" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-week>

  <mlv-week layout="horizontal">
    <label>disabled</label>
    <input type="week" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-week>

  <mlv-week layout="horizontal">
    <label>success</label>
    <input type="week" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-week>

  <mlv-week layout="horizontal">
    <label>error</label>
    <input type="week" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-week>
</div>`
};
