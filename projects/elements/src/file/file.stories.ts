import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/file/define.js';

export default {
  title: 'Elements/File/Examples',
  component: 'mlv-file',
};

export const File = {
  render: () => html`
<mlv-file>
  <label>file</label>
  <input type="file" />
  <mlv-control-message>message</mlv-control-message>
</mlv-file>
`
};

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-file>
    <label>label</label>
    <input type="file" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-file>

  <mlv-file>
    <label>disabled</label>
    <input type="file" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-file>

  <mlv-file>
    <label>success</label>
    <input type="file" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-file>

  <mlv-file>
    <label>error</label>
    <input type="file" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-file>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-file layout="horizontal">
    <label>label</label>
    <input type="file" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-file>

  <mlv-file layout="horizontal">
    <label>disabled</label>
    <input type="file" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-file>

  <mlv-file layout="horizontal">
    <label>success</label>
    <input type="file" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-file>

  <mlv-file layout="horizontal">
    <label>error</label>
    <input type="file" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-file>
</div>`
};
