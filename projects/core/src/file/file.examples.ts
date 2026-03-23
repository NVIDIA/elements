import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/file/define.js';

export default {
  title: 'Elements/File',
  component: 'nve-file',
};

/**
 * @summary Basic file input with label and validation message. Use for simple file upload fields in forms.
 */
export const Default = {
  render: () => html`
<nve-file>
  <label>file</label>
  <input type="file" />
  <nve-control-message>message</nve-control-message>
</nve-file>
`
};

/**
 * @summary Vertical layout file inputs showing all validation states including disabled, success, and error. Use for stacked form layouts where labels appear above inputs.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-file>
    <label>label</label>
    <input type="file" />
    <nve-control-message>message</nve-control-message>
  </nve-file>

  <nve-file>
    <label>disabled</label>
    <input type="file" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-file>

  <nve-file>
    <label>success</label>
    <input type="file" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-file>

  <nve-file>
    <label>error</label>
    <input type="file" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-file>
</div>`
};

/**
 * @summary Horizontal layout file inputs with side-by-side labels. Ideal for compact forms or when aligning labels with other horizontal form controls.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-file layout="horizontal">
    <label>label</label>
    <input type="file" />
    <nve-control-message>message</nve-control-message>
  </nve-file>

  <nve-file layout="horizontal">
    <label>disabled</label>
    <input type="file" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-file>

  <nve-file layout="horizontal">
    <label>success</label>
    <input type="file" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-file>

  <nve-file layout="horizontal">
    <label>error</label>
    <input type="file" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-file>
</div>`
};
