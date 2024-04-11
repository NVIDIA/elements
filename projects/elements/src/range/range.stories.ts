import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/range/define.js';

export default {
  title: 'Elements/Range/Examples',
  component: 'mlv-range',
};

export const Range = {
  render: () => html`
<mlv-range>
  <label>label</label>
  <input type="range" />
  <mlv-control-message>message</mlv-control-message>
</mlv-range>`
};

export const Datalist = {
  render: () => html`
<mlv-range>
<label>label</label>
  <input type="range" />
  <mlv-control-message>message</mlv-control-message>
  <datalist>
    <option value="0">0</option>
    <option value="25"></option>
    <option value="50"></option>
    <option value="75"></option>
    <option value="100"></option>
  </datalist>
</mlv-range>
  `
}

export const Step = {
  render: () => html`
<mlv-range>
  <label>label</label>
  <input type="range" min="25" max="75" step="5" />
  <mlv-control-message>message</mlv-control-message>
</mlv-range>
  `
}

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-range>
    <label>label</label>
    <input type="range" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-range>
    <label>disabled</label>
    <input type="range" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-range>
    <label>success</label>
    <input type="range" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-range>

  <mlv-range>
    <label>error</label>
    <input type="range" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-range>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-range layout="horizontal">
    <label>label</label>
    <input type="range" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-range layout="horizontal">
    <label>disabled</label>
    <input type="range" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-range layout="horizontal">
    <label>success</label>
    <input type="range" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-range>

  <mlv-range layout="horizontal">
    <label>error</label>
    <input type="range" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-range>
</div>`
};
