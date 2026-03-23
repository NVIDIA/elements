import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/checkbox/define.js';

export default {
  title: 'Elements/Checkbox',
  component: 'nve-checkbox',
};

/**
 * @summary Basic checkbox component with label for binary selection and form input.
 */
export const Default = {
  render: () => html`
<nve-checkbox>
  <label>label</label>
  <input type="checkbox" checked />
</nve-checkbox>`
};

/**
 * @summary Checkbox states including default, disabled, success, and error with control messages for validation feedback.
 */
export const States = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox>
    <label>label</label>
    <input type="checkbox" />
    <nve-control-message>message</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>disabled</label>
    <input type="checkbox" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>success</label>
    <input type="checkbox" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>error</label>
    <input type="checkbox" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-checkbox>
</div>`
};

/**
 * @summary Checkbox group with vertical layout for related options stacked in a column with validation states.
 */
export const VerticalGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group>
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group>
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group>
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group>
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

/**
 * @summary Checkbox group with vertical inline layout for compact vertical stacking with inline label positioning.
 * @tags test-case
 */
export const VerticalInlineGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group layout="vertical-inline">
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="vertical-inline">
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="vertical-inline">
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="vertical-inline">
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

/**
 * @summary Checkbox group with horizontal layout for related options arranged in a row, ideal for limited choices.
 * @tags test-case
 */
export const HorizontalGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group layout="horizontal">
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal">
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal">
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal">
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

/**
 * @summary Checkbox group with horizontal inline layout for space-efficient horizontal arrangement with inline labels.
 * @tags test-case
 */
export const HorizontalInlineGroup = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group layout="horizontal-inline">
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal-inline">
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal-inline">
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal-inline">
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

/**
 * @summary Checkbox with indeterminate state for representing partial selection or mixed values in hierarchical lists.
 * @tags test-case
 */
export const Indeterminate = {
  render: () => html`
<nve-checkbox>
  <label>checkbox 1</label>
  <input type="checkbox" checked id="indeterminate" />
</nve-checkbox>
<script type="module">
  document.querySelector('#indeterminate').indeterminate = true;
</script>
`
};