import { html } from 'lit';
import '@elements/elements/radio/define.js';

export default {
  title: 'Elements/Radio/Examples',
  component: 'mlv-input',
  parameters: { badges: ['beta'] }
};

export const radio = {
  render: () => html`
  <mlv-radio-group>
    <label>label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>
  `
}

export const VerticalGroup = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-radio-group>
    <label>label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group>
    <label>disabled</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </mlv-radio>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group>
    <label>success</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group>
    <label>error</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-radio-group>
</div>
`
};

export const VerticalInlineGroup = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-radio-group layout="vertical-inline">
    <label>label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="vertical-inline">
    <label>disabled</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </mlv-radio>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="vertical-inline">
    <label>success</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="vertical-inline">
    <label>error</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-radio-group>
</div>
`
};

export const HorizontalGroup = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-radio-group layout="horizontal">
    <label>label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="horizontal">
    <label>disabled</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </mlv-radio>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="horizontal">
    <label>success</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="horizontal">
    <label>error</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-radio-group>
</div>
`
};

export const HorizontalInlineGroup = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-radio-group layout="horizontal-inline">
    <label>label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="horizontal-inline">
    <label>disabled</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </mlv-radio>
    <mlv-control-message>disabled message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="horizontal-inline">
    <label>success</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="success">success message</mlv-control-message>
  </mlv-radio-group>

  <mlv-radio-group layout="horizontal-inline">
    <label>error</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message status="error">error message</mlv-control-message>
  </mlv-radio-group>
</div>
`
};
