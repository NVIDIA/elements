import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/datetime/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/month/define.js';
import '@nvidia-elements/core/week/define.js';
import '@nvidia-elements/core/time/define.js';

export default {
  title: 'Elements/Date',
  component: 'nve-date',
};

/**
 * @summary Basic date picker input with label and message for selecting calendar dates.
 */
export const Default = {
  render: () => html`
<nve-date>
  <label>date</label>
  <input type="date" />
  <nve-control-message>message</nve-control-message>
</nve-date>
`
};

/**
 * @summary Date picker with datalist providing suggested date options for quick selection from predefined dates.
 */
export const Datalist = {
  render: () => html`
<nve-date>
  <label>label</label>
  <input type="date" />
  <nve-control-message>message</nve-control-message>
  <datalist>
    <option value="2018-07-22"></option>
    <option value="2018-01-01"></option>
    <option value="2018-12-31"></option>
  </datalist>
</nve-date>
  `
}

/**
 * @summary Date pickers with vertical layout including validation states for disabled, success, and error.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-date>
    <label>label</label>
    <input type="date" />
    <nve-control-message>message</nve-control-message>
  </nve-date>

  <nve-date>
    <label>disabled</label>
    <input type="date" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-date>

  <nve-date>
    <label>success</label>
    <input type="date" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-date>

  <nve-date>
    <label>error</label>
    <input type="date" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-date>
</div>`
};

/**
 * @summary Date pickers with horizontal layout showing validation states for inline forms and compact layouts.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-date layout="horizontal">
    <label>label</label>
    <input type="date" />
    <nve-control-message>message</nve-control-message>
  </nve-date>

  <nve-date layout="horizontal">
    <label>disabled</label>
    <input type="date" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-date>

  <nve-date layout="horizontal">
    <label>success</label>
    <input type="date" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-date>

  <nve-date layout="horizontal">
    <label>error</label>
    <input type="date" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-date>
</div>`
};

/**
 * @summary Date range input with start and end date pickers for selecting time periods and date intervals.
 */
export const Range = {
  render: () => html`
<nve-input-group>
  <label>date range</label>
  <nve-date>
    <input type="date" aria-label="start date" value="2018-07-22" />
  </nve-date>
  <nve-date>
    <input type="date" aria-label="end date" value="2022-07-22" />
  </nve-date>
  <nve-control-message>message</nve-control-message>
</nve-input-group>
`
};

/**
 * @summary Collection of temporal input types including date, datetime, month, week, time, and date range pickers.
 */
export const Types = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-date layout="horizontal">
    <label>date label</label>
    <input type="date" />
    <nve-control-message>message</nve-control-message>
  </nve-date>

  <nve-datetime layout="horizontal">
    <label>datetime label</label>
    <input type="datetime-local" />
    <nve-control-message>message</nve-control-message>
  </nve-datetime>

  <nve-month layout="horizontal">
    <label>month label</label>
    <input type="month" />
    <nve-control-message>message</nve-control-message>
  </nve-month>

  <nve-week layout="horizontal">
    <label>week label</label>
    <input type="week" />
    <nve-control-message>message</nve-control-message>
  </nve-week>

  <nve-time layout="horizontal">
    <label>time label</label>
    <input type="time" />
    <nve-control-message>message</nve-control-message>
  </nve-time>

  <nve-input-group layout="horizontal">
    <label>date range</label>
    <nve-date>
      <input type="date" aria-label="start date" value="2018-07-22" />
    </nve-date>
    <nve-date>
      <input type="date" aria-label="end date" value="2022-07-22" />
    </nve-date>
    <nve-control-message>message</nve-control-message>
  </nve-input-group>
</div>
`
}

/**
 * @summary Date picker with fit-text styling that adjusts width to match the selected date value for compact displays.
 * @tags test-case
 */
export const FitText = {
  render: () => html`
<nve-date fit-text>
  <label>date</label>
  <input type="date" value="2017-06-01" />
  <nve-control-message>message</nve-control-message>
</nve-date>
`
};
