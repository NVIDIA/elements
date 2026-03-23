import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/switch/define.js';

export default {
  title: 'Elements/Switch',
  component: 'nve-switch',
};

/**
 * @summary Basic toggle switch for binary on/off controls and feature activation.
 */
export const Default = {
  render: () => html`
<nve-switch>
  <label>label</label>
  <input type="checkbox" />
</nve-switch>`
};


/**
 * @summary Size variants of toggle switches use custom CSS properties.
 * @tags test-case
 */
export const Size = {
  render: () => html`
<nve-switch style="
      --width: var(--nve-ref-size-800);
      --height: var(--nve-ref-size-400);
      --anchor-width: calc(var(--nve-ref-size-200) + var(--nve-ref-size-50));
      --anchor-height: calc(var(--nve-ref-size-200) + var(--nve-ref-size-50));">
  <label>label</label>
  <input type="checkbox" />
</nve-switch>`
};

/**
 * @summary Toggle switches with different states including default, disabled, success, and error with control messages.
 */
export const States = {
  render: () => html`
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

/**
 * @summary Switch groups with vertical layout for many related toggles stacked in a column with validation states.
 */
export const VerticalGroup = {
  render: () => html`
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

/**
 * @summary Switch groups with vertical inline layout for compact vertical stacking with inline label positioning.
 * @tags test-case
 */
export const VerticalInlineGroup = {
  render: () => html`
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

/**
 * @summary Switch groups with horizontal layout for many toggles arranged in a row, ideal for limited options.
 * @tags test-case
 */
export const HorizontalGroup = {
  render: () => html`
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

/**
 * @summary Switch groups with horizontal inline layout for space-efficient horizontal arrangement with inline labels.
 * @tags test-case
 */
export const HorizontalInlineGroup = {
  render: () => html`
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
