import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/color/define.js';

export default {
  title: 'Elements/Color',
  component: 'nve-color',
};

export const Default = {
  render: () => html`
<nve-color>
  <label>label</label>
  <input type="color" />
  <nve-control-message>message</nve-control-message>
</nve-color>
`
};

export const Datalist = {
  render: () => html`
<nve-color>
<label>label</label>
  <input type="color" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="#1a6b00"></option>
    <option value="#448d00"></option>
    <option value="#69b027"></option>
    <option value="#8ac057"></option>
    <option value="#a9d081"></option>
    <option value="#0758bb"></option>
    <option value="#0865d8"></option>
    <option value="#0971f1"></option>
    <option value="#7298f4"></option>
    <option value="#a1b7f7"></option>
    <option value="#b43931"></option>
    <option value="#d04238"></option>
    <option value="#e94a3f"></option>
    <option value="#ee847f"></option>
    <option value="#f2aba8"></option>
  </datalist>
</nve-color>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-color>
    <label>label</label>
    <input type="color" />
    <nve-control-message>message</nve-control-message>
  </nve-color>

  <nve-color>
    <label>disabled</label>
    <input type="color" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-color>

  <nve-color>
    <label>success</label>
    <input type="color" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-color>

  <nve-color>
    <label>error</label>
    <input type="color" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-color>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-color layout="horizontal">
    <label>label</label>
    <input type="color" />
    <nve-control-message>message</nve-control-message>
  </nve-color>

  <nve-color layout="horizontal">
    <label>disabled</label>
    <input type="color" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-color>

  <nve-color layout="horizontal">
    <label>success</label>
    <input type="color" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-color>

  <nve-color layout="horizontal">
    <label>error</label>
    <input type="color" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-color>
</div>`
};
