import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/radio/define.js';

export default {
  title: 'Elements/Radio',
  component: 'nve-radio',
};

/**
 * @summary Basic radio button group for mutually exclusive single-choice selection from many options.
 */
export const Default = {
  render: () => html`
  <nve-radio-group>
    <label>label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>
  `
}

/**
 * @summary Radio groups with vertical layout including validation states for disabled, success, and error.
 */
export const VerticalGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-radio-group>
    <label>label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group>
    <label>disabled</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </nve-radio>
    <nve-control-message>disabled message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group>
    <label>success</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group>
    <label>error</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-radio-group>
</div>
`
};

/**
 * @summary Radio groups with vertical inline layout for compact vertical stacking with inline label positioning.
 * @tags test-case
 */
export const VerticalInlineGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-radio-group layout="vertical-inline">
    <label>label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="vertical-inline">
    <label>disabled</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </nve-radio>
    <nve-control-message>disabled message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="vertical-inline">
    <label>success</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="vertical-inline">
    <label>error</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-radio-group>
</div>
`
};

/**
 * @summary Radio groups with horizontal layout for options arranged in a row, ideal for limited choices.
 * @tags test-case
 */
export const HorizontalGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-radio-group layout="horizontal">
    <label>label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="horizontal">
    <label>disabled</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </nve-radio>
    <nve-control-message>disabled message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="horizontal">
    <label>success</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="horizontal">
    <label>error</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-radio-group>
</div>
`
};

/**
 * @summary Radio groups with horizontal inline layout for space-efficient horizontal arrangement with inline labels.
 * @tags test-case
 */
export const HorizontalInlineGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-radio-group layout="horizontal-inline">
    <label>label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="horizontal-inline">
    <label>disabled</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" disabled />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" disabled />
    </nve-radio>
    <nve-control-message>disabled message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="horizontal-inline">
    <label>success</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-radio-group>

  <nve-radio-group layout="horizontal-inline">
    <label>error</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-radio-group>
</div>
`
};
