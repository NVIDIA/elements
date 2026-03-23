import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/time/define.js';

export default {
  title: 'Elements/Time',
  component: 'nve-time',
};

/**
 * @summary Basic time input with label, min/max time constraints, and help message
 */
export const Default = {
  render: () => html`
<nve-time>
  <label>label</label>
  <input type="time" min="09:00" max="18:00" value="12:00" />
  <nve-control-message>message</nve-control-message>
</nve-time>`
};

/**
 * @summary Time input with datalist slot for predefined time options users can select from
 */
export const Datalist = {
  render: () => html`
<nve-time>
  <label>label</label>
  <input type="time" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="12:00"></option>
    <option value="13:00"></option>
    <option value="14:00"></option>
  </datalist>
</nve-time>
  `
}

/**
 * @summary Vertical field layout showcasing default, disabled, success, and error states
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-time>
    <label>label</label>
    <input type="time" />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time>
    <label>disabled</label>
    <input type="time" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time>
    <label>success</label>
    <input type="time" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-time>

  <nve-time>
    <label>error</label>
    <input type="time" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-time>
</div>`
};

/**
 * @summary Horizontal field layout with label beside input, showing default, disabled, success, and error states
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-time layout="horizontal">
    <label>label</label>
    <input type="time" />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>disabled</label>
    <input type="time" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>success</label>
    <input type="time" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>error</label>
    <input type="time" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-time>
</div>`
};
