import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/time/define.js';

export default {
  title: 'Elements/Time/Examples',
  component: 'mlv-time',
  parameters: { badges: ['alpha'] }
};

export const Time = {
  render: () => html`
<mlv-time>
  <label>label</label>
  <input type="time" min="09:00" max="18:00" value="12:00" />
  <mlv-control-message>message</mlv-control-message>
</mlv-time>`
};

export const Datalist = {
  render: () => html`
<mlv-time>
  <label>label</label>
  <input type="time" />
  <mlv-control-message>message</mlv-control-message>
  <datalist>
    <option value="12:00"></option>
    <option value="13:00"></option>
    <option value="14:00"></option>
  </datalist>
</mlv-time>
  `
}

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-time>
    <label>label</label>
    <input type="time" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-time>

  <mlv-time>
    <label>disabled</label>
    <input type="time" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-time>

  <mlv-time>
    <label>success</label>
    <input type="time" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-time>

  <mlv-time>
    <label>error</label>
    <input type="time" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-time>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-time layout="horizontal">
    <label>label</label>
    <input type="time" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-time>

  <mlv-time layout="horizontal">
    <label>disabled</label>
    <input type="time" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-time>

  <mlv-time layout="horizontal">
    <label>success</label>
    <input type="time" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-time>

  <mlv-time layout="horizontal">
    <label>error</label>
    <input type="time" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-time>
</div>`
};
