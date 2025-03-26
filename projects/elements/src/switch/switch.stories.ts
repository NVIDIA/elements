import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/switch/define.js';

export default {
  title: 'Elements/Switch/Examples',
  component: 'nve-switch',
};

export const Default = () => {
  return html`
<nve-switch>
  <label>label</label>
  <input type="checkbox" />
</nve-switch>`
};

export const States = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-switch>
    <label>label</label>
    <input type="checkbox" />
    <nve-control-message>message</nve-control-message>
  </nve-switch>

  <nve-switch>
    <label>disabled</label>
    <input type="checkbox" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-switch>

  <nve-switch>
    <label>success</label>
    <input type="checkbox" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-switch>

  <nve-switch>
    <label>error</label>
    <input type="checkbox" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-switch>
</div>`
};

export const VerticalGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-switch-group>
    <label>label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group>
    <label>disabled</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </nve-switch>
    <nve-control-message>disabled message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group>
    <label>success</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group>
    <label>error</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-switch-group>
</div>
`
};

export const VerticalInlineGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-switch-group layout="vertical-inline">
    <label>label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="vertical-inline">
    <label>disabled</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </nve-switch>
    <nve-control-message>disabled message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="vertical-inline">
    <label>success</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="vertical-inline">
    <label>error</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-switch-group>
</div>
`
};

export const HorizontalGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-switch-group layout="horizontal">
    <label>label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="horizontal">
    <label>disabled</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </nve-switch>
    <nve-control-message>disabled message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="horizontal">
    <label>success</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="horizontal">
    <label>error</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-switch-group>
</div>
`
};

export const HorizontalInlineGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-switch-group layout="horizontal-inline">
    <label>label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="horizontal-inline">
    <label>disabled</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </nve-switch>
    <nve-control-message>disabled message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="horizontal-inline">
    <label>success</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-switch-group>

  <nve-switch-group layout="horizontal-inline">
    <label>error</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-switch-group>
</div>
`
};
