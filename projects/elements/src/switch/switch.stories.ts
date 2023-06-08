import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/switch/define.js';

export default {
  title: 'Elements/Switch/Examples',
  component: 'mlv-switch',
};

export const Switch = () => {
  return html`
<mlv-switch>
  <label>label</label>
  <input type="checkbox" />
</mlv-switch>`
};

export const States = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-switch>
    <label>label</label>
    <input type="checkbox" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch>

  <mlv-switch>
    <label>disabled</label>
    <input type="checkbox" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch>

  <mlv-switch>
    <label>success</label>
    <input type="checkbox" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-switch>

  <mlv-switch>
    <label>error</label>
    <input type="checkbox" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-switch>
</div>`
};

export const VerticalGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-switch-group>
    <label>label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group>
    <label>disabled</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </mlv-switch>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group>
    <label>success</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group>
    <label>error</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-switch-group>
</div>
`
};

export const VerticalInlineGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-switch-group layout="vertical-inline">
    <label>label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="vertical-inline">
    <label>disabled</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </mlv-switch>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="vertical-inline">
    <label>success</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="vertical-inline">
    <label>error</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-switch-group>
</div>
`
};

export const HorizontalGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-switch-group layout="horizontal">
    <label>label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="horizontal">
    <label>disabled</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </mlv-switch>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="horizontal">
    <label>success</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="horizontal">
    <label>error</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-switch-group>
</div>
`
};

export const HorizontalInlineGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-switch-group layout="horizontal-inline">
    <label>label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="horizontal-inline">
    <label>disabled</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" disabled />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" disabled />
    </mlv-switch>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="horizontal-inline">
    <label>success</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-switch-group>

  <mlv-switch-group layout="horizontal-inline">
    <label>error</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" checked />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 3</label>
      <input type="checkbox" />
    </mlv-switch>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-switch-group>
</div>
`
};
