import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/file/define.js';

export default {
  title: 'Elements/File/Examples',
  component: 'nve-file',
};

export const Default = {
  render: () => html`
<nve-file>
  <label>file</label>
  <input type="file" />
  <nve-control-message>message</nve-control-message>
</nve-file>
`
};

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
