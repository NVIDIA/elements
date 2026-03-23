import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/textarea/define.js';

export default {
  title: 'Elements/Textarea',
  component: 'nve-textarea',
};

/**
 * @summary Basic multi-line text input for longer content entry like comments, descriptions, or messages.
 */
export const Default = {
  render: () => html`
<nve-textarea>
  <label>label</label>
  <textarea></textarea>
  <nve-control-message>message</nve-control-message>
</nve-textarea>`
};

/**
 * @summary Textareas with vertical layout including validation states for disabled, success, and error.
 * @tags test-case
 */
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

/**
 * @summary Textareas with horizontal layout showing validation states for inline forms and compact layouts.
 * @tags test-case
 */
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

/**
 * @summary Textarea with built-in HTML validation showing required field error messages for form validation.
 */
export const ControlValidation = {
  render: () => html`
<nve-textarea>
  <label>validation</label>
  <textarea required></textarea>
  <nve-control-message>message</nve-control-message>
  <nve-control-message error="valueMissing">required</nve-control-message>
</nve-textarea>`
};

/**
 * @summary Textarea with custom columns and rows attributes for controlling initial size and dimensions.
 */
export const ColumnsAndRows = {
  render: () => html`
<nve-textarea>
  <label>label</label>
  <textarea rows="15" cols="40"></textarea>
  <nve-control-message>message</nve-control-message>
</nve-textarea>`
};