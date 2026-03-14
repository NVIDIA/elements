import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/range/define.js';

export default {
  title: 'Elements/Range',
  component: 'nve-range',
};

/**
 * @summary Basic range component for numeric value selection, providing a simple slider interface for adjusting values within a defined range.
 */
export const Default = {
  render: () => html`
<nve-range>
  <label>label</label>
  <input type="range" />
  <nve-control-message>message</nve-control-message>
</nve-range>`
};

/**
 * @summary Range with datalist for visual tick marks and labeled values, enabling users to see available options and precisely select predetermined values.
 */
export const Datalist = {
  render: () => html`
<nve-range>
<label>label</label>
  <input type="range" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="0">0</option>
    <option value="25"></option>
    <option value="50"></option>
    <option value="75"></option>
    <option value="100"></option>
  </datalist>
</nve-range>
  `
}

/**
 * @summary Range with combined step increments and datalist labels, ensuring precise value selection with clear visual indicators at each valid step position.
 */
export const DatalistWithSteps = {
  render: () => html`
<nve-range>
<label>label</label>
  <input type="range" min="0" max="100" step="10" />
  <datalist>
    <option value="0">0</option>
    <option value="10">10</option>
    <option value="20">20</option>
    <option value="30">30</option>
    <option value="40">40</option>
    <option value="50">50</option>
    <option value="60">60</option>
    <option value="70">70</option>
    <option value="80">80</option>
    <option value="90">90</option>
    <option value="100">100</option>
  </datalist>
</nve-range>
  `
}

/**
 * @summary Range with defined step increments for discrete value selection, constraining the slider to specific intervals for controlled input precision.
 */
export const Step = {
  render: () => html`
<nve-range>
  <label>label</label>
  <input type="range" min="0" max="100" step="20" />
  <nve-control-message>message</nve-control-message>
</nve-range>
  `
}

/**
 * @summary Vertical layout configuration for stacked form arrangements, displaying label, slider, and message in a column format with support for states including disabled, success, and error feedback.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-range>
    <label>label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range>
    <label>disabled</label>
    <input type="range" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range>
    <label>success</label>
    <input type="range" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-range>

  <nve-range>
    <label>error</label>
    <input type="range" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-range>
</div>`
};

/**
 * @summary Horizontal layout configuration for inline form arrangements, positioning label and slider side-by-side for compact displays with support for states including disabled, success, and error feedback.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg full">
  <nve-range layout="horizontal">
    <label>label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>disabled</label>
    <input type="range" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>success</label>
    <input type="range" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>error</label>
    <input type="range" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-range>
</div>`
};

/**
 * @summary Vertical range slider for space-constrained layouts or controls where bottom-to-top value selection is intuitive, such as volume or equalizer adjustments.
 */
export const OrientationVertical = {
  render: () => html`
<div style="height: 200px">
  <nve-range orientation="vertical">
    <label>label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>
</div>`
};

/**
 * @summary Vertical range slider with datalist tick marks and labeled values for precise value selection in vertical layouts.
 */
export const OrientationVerticalDatalist = {
  render: () => html`
<div style="height: 250px">
  <nve-range orientation="vertical">
    <label>label</label>
    <input type="range" />
    <datalist>
      <option value="0">0</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="75">75</option>
      <option value="100">100</option>
    </datalist>
  </nve-range>
</div>`
};

/**
 * @summary Range component can have its visual styles overwritten to accomplish custom themes.
 * @tags test-case
 */
export const CustomStyles = {
  render: () => html`
<nve-range style="
--background: #76b900;
--track-height: 4px;
--track-border-radius: 16px;
--thumb-background: black;
--thumb-border: inset 0 0 0 2px white;
--thumb-width: 14px;
--thumb-height: 14px;">
  <input type="range" aria-label="range" />
</nve-range>`
};