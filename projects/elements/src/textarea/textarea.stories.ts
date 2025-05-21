import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/textarea/define.js';

export default {
  title: 'Elements/Textarea',
  component: 'nve-textarea',
};

export const Default = {
  render: () => html`
<nve-textarea>
  <label>label</label>
  <textarea></textarea>
  <nve-control-message>message</nve-control-message>
</nve-textarea>`
};

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-textarea>
    <label>label</label>
    <textarea></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>disabled</label>
    <textarea disabled></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>success</label>
    <textarea></textarea>
    <nve-control-message status="success">message</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>error</label>
    <textarea></textarea>
    <nve-control-message status="error">message</nve-control-message>
  </nve-textarea>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-textarea layout="horizontal">
    <label>label</label>
    <textarea></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>

  <nve-textarea layout="horizontal">
    <label>disabled</label>
    <textarea disabled></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>

  <nve-textarea layout="horizontal">
    <label>success</label>
    <textarea></textarea>
    <nve-control-message status="success">message</nve-control-message>
  </nve-textarea>

  <nve-textarea layout="horizontal">
    <label>error</label>
    <textarea></textarea>
    <nve-control-message status="error">message</nve-control-message>
  </nve-textarea>
</div>`
};

export const ControlValidation = () => {
  return html`
<nve-textarea>
  <label>validation</label>
  <textarea required></textarea>
  <nve-control-message>message</nve-control-message>
  <nve-control-message error="valueMissing">required</nve-control-message>
</nve-textarea>`;
}

export const ColumnsAndRows = () => {
  return html`
<nve-textarea>
  <label>label</label>
  <textarea rows="15" cols="40"></textarea>
  <nve-control-message>message</nve-control-message>
</nve-textarea>`;
}