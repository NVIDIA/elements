import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/color/define.js';

export default {
  title: 'Elements/Color/Examples',
  component: 'mlv-color',
  parameters: { badges: ['alpha'] }
};

export const Color = {
  render: () => html`
<mlv-color>
  <label>label</label>
  <input type="color" />
  <mlv-control-message>message</mlv-control-message>
</mlv-color>
`
};

export const Datalist = {
  render: () => html`
<mlv-color>
<label>label</label>
  <input type="color" />
  <mlv-control-message>message</mlv-control-message>
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
</mlv-color>
  `
}

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <mlv-color>
    <label>label</label>
    <input type="color" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-color>

  <mlv-color>
    <label>disabled</label>
    <input type="color" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-color>

  <mlv-color>
    <label>success</label>
    <input type="color" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-color>

  <mlv-color>
    <label>error</label>
    <input type="color" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-color>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <mlv-color layout="horizontal">
    <label>label</label>
    <input type="color" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-color>

  <mlv-color layout="horizontal">
    <label>disabled</label>
    <input type="color" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-color>

  <mlv-color layout="horizontal">
    <label>success</label>
    <input type="color" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-color>

  <mlv-color layout="horizontal">
    <label>error</label>
    <input type="color" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-color>
</div>`
};
