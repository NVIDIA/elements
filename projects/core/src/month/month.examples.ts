import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/month/define.js';

export default {
  title: 'Elements/Month',
  component: 'nve-month',
};

/**
 * @summary Basic month picker with label and validation message. Use for selecting a month and year in forms, such as expiry dates or report periods.
 */
export const Default = {
  render: () => html`
<nve-month>
  <label>label</label>
  <input type="month" />
  <nve-control-message>message</nve-control-message>
</nve-month>
`
};

/**
 * @summary Month picker with predefined suggestions via datalist. Ideal for guiding users toward common or expected month selections.
 */
export const Datalist = {
  render: () => html`
<nve-month>
  <label>label</label>
  <input type="month" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="2018-04"></option>
    <option value="2018-05"></option>
    <option value="2018-06"></option>
  </datalist>
</nve-month>
  `
}

/**
 * @summary Vertical layout month inputs showing all validation states including disabled, success, and error. Use for stacked form layouts where labels appear above inputs.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-month>
    <label>label</label>
    <input type="month" />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month>
    <label>disabled</label>
    <input type="month" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month>
    <label>success</label>
    <input type="month" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-month>

  <nve-month>
    <label>error</label>
    <input type="month" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-month>
</div>`
};

/**
 * @summary Horizontal layout month inputs with side-by-side labels. Ideal for compact forms or when aligning labels with other horizontal form controls.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-month layout="horizontal">
    <label>label</label>
    <input type="month" />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>disabled</label>
    <input type="month" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>success</label>
    <input type="month" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>error</label>
    <input type="month" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-month>
</div>`
};
