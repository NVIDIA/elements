import { html } from 'lit';
import '@elements/elements/checkbox/define.js';

export default {
  title: 'Elements/Checkbox/Examples',
  component: 'mlv-checkbox',
  parameters: { badges: ['beta'] }
};

export const Checkbox = () => {
  return html`
<mlv-checkbox>
  <label>label</label>
  <input type="checkbox" />
</mlv-checkbox>`
};

export const States = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-checkbox>
    <label>label</label>
    <input type="checkbox" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox>

  <mlv-checkbox>
    <label>disabled</label>
    <input type="checkbox" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox>

  <mlv-checkbox>
    <label>success</label>
    <input type="checkbox" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-checkbox>

  <mlv-checkbox>
    <label>error</label>
    <input type="checkbox" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-checkbox>
</div>`
};

export const VerticalGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-checkbox-group>
    <label>label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group>
    <label>disabled</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group>
    <label>success</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group>
    <label>error</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-checkbox-group>
</div>
`
};

export const VerticalInlineGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-checkbox-group layout="vertical-inline">
    <label>label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="vertical-inline">
    <label>disabled</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="vertical-inline">
    <label>success</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="vertical-inline">
    <label>error</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-checkbox-group>
</div>
`
};

export const HorizontalGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-checkbox-group layout="horizontal">
    <label>label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="horizontal">
    <label>disabled</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="horizontal">
    <label>success</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="horizontal">
    <label>error</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-checkbox-group>
</div>
`
};

export const HorizontalInlineGroup = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-checkbox-group layout="horizontal-inline">
    <label>label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="horizontal-inline">
    <label>disabled</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </mlv-checkbox>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="horizontal-inline">
    <label>success</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-checkbox-group layout="horizontal-inline">
    <label>error</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-checkbox-group>
</div>
`
};
