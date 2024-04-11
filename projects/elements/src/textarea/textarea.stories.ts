import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/textarea/define.js';

export default {
  title: 'Elements/Textarea/Examples',
  component: 'mlv-textarea',
};

export const Textarea = {
  render: () => html`
<mlv-textarea>
  <label>label</label>
  <textarea></textarea>
  <mlv-control-message>message</mlv-control-message>
</mlv-textarea>`
};

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-textarea>
    <label>label</label>
    <textarea></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>

  <mlv-textarea>
    <label>disabled</label>
    <textarea disabled></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>

  <mlv-textarea>
    <label>success</label>
    <textarea></textarea>
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-textarea>

  <mlv-textarea>
    <label>error</label>
    <textarea></textarea>
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-textarea>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-textarea layout="horizontal">
    <label>label</label>
    <textarea></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>

  <mlv-textarea layout="horizontal">
    <label>disabled</label>
    <textarea disabled></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>

  <mlv-textarea layout="horizontal">
    <label>success</label>
    <textarea></textarea>
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-textarea>

  <mlv-textarea layout="horizontal">
    <label>error</label>
    <textarea></textarea>
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-textarea>
</div>`
};

export const ControlValidation = () => {
  return html`
<mlv-textarea>
  <label>validation</label>
  <textarea required></textarea>
  <mlv-control-message>message</mlv-control-message>
  <mlv-control-message error="valueMissing">required</mlv-control-message>
</mlv-textarea>`;
}

export const ColumnsAndRows = () => {
  return html`
<mlv-textarea>
  <label>label</label>
  <textarea rows="15" cols="40"></textarea>
  <mlv-control-message>message</mlv-control-message>
</mlv-textarea>`;
}