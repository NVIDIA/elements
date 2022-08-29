import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Forms/Input/Examples',
  component: 'mlv-input',
  parameters: { badges: ['beta'] }
};

export const Input = () => {
  return html`
<mlv-input>
  <label>label</label>
  <input type="text" required />
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const Vertical = () => {
  return html`
<div mlv-layout="column gap:lg">
  <mlv-input>
    <label>label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input>
    <label>disabled</label>
    <input disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input>
    <label>success</label>
    <input />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-input>

  <mlv-input>
    <label>error</label>
    <input />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-input>
</div>`
};

export const Horizontal = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-input layout="horizontal">
    <label>label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input layout="horizontal">
    <label>disabled</label>
    <input disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input layout="horizontal">
    <label>success</label>
    <input />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-input>

  <mlv-input layout="horizontal">
    <label>error</label>
    <input />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-input>
</div>`
};

export const Rounded = {
  render: () => html`
<mlv-input rounded>
  <label>label</label>
  <input />
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const controlValidation = () => {
  return html`
<mlv-input>
  <label>validation</label>
  <input required />
  <mlv-control-message>message</mlv-control-message>
  <mlv-control-message error="valueMissing">required</mlv-control-message>
</mlv-input>`;
}
