import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/password/define.js';

export default {
  title: 'Elements/Password/Examples',
  component: 'mlv-password',
  parameters: { badges: ['beta'] }
};

export const Password = {
  render: () => html`
<mlv-password>
  <label>label</label>
  <input type="password" value="123456" />
  <mlv-control-message>message</mlv-control-message>
</mlv-password>`
};

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-password>
    <label>label</label>
    <input type="password" value="123456" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-password>
    <label>disabled</label>
    <input type="password" value="123456" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-password>
    <label>success</label>
    <input type="password" value="123456" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-password>

  <mlv-password>
    <label>error</label>
    <input type="password" value="123456" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-password>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-password layout="horizontal">
    <label>label</label>
    <input type="password" value="123456" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-password layout="horizontal">
    <label>disabled</label>
    <input type="password" value="123456" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-password layout="horizontal">
    <label>success</label>
    <input type="password" value="123456" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-password>

  <mlv-password layout="horizontal">
    <label>error</label>
    <input type="password" value="123456" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-password>
</div>`
};
