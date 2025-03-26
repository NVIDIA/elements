import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/range/define.js';

export default {
  title: 'Elements/Range/Examples',
  component: 'nve-range',
};

export const Default = {
  render: () => html`
<nve-range>
  <label>label</label>
  <input type="range" />
  <nve-control-message>message</nve-control-message>
</nve-range>`
};

export const Datalist = {
  render: () => html`
<nve-range>
<label>label</label>
  <input type="range" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="0">0</option>
    <option value="25"></option>
    <option value="50"></option>
    <option value="75"></option>
    <option value="100"></option>
  </datalist>
</nve-range>
  `
}

export const Step = {
  render: () => html`
<nve-range>
  <label>label</label>
  <input type="range" min="25" max="75" step="5" />
  <nve-control-message>message</nve-control-message>
</nve-range>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-range>
    <label>label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range>
    <label>disabled</label>
    <input type="range" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range>
    <label>success</label>
    <input type="range" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-range>

  <nve-range>
    <label>error</label>
    <input type="range" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-range>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-range layout="horizontal">
    <label>label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>disabled</label>
    <input type="range" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>success</label>
    <input type="range" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>error</label>
    <input type="range" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-range>
</div>`
};
