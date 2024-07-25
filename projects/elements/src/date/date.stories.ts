import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/datetime/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/month/define.js';
import '@nvidia-elements/core/week/define.js';
import '@nvidia-elements/core/time/define.js';

export default {
  title: 'Elements/Date/Examples',
  component: 'mlv-date',
};

export const Date = {
  render: () => html`
<mlv-date>
  <label>date</label>
  <input type="date" />
  <mlv-control-message>message</mlv-control-message>
</mlv-date>
`
};

export const Datalist = {
  render: () => html`
<mlv-date>
  <label>label</label>
  <input type="date" />
  <mlv-control-message>message</mlv-control-message>
  <datalist>
    <option value="2018-07-22"></option>
    <option value="2018-01-01"></option>
    <option value="2018-12-31"></option>
  </datalist>
</mlv-date>
  `
}

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <mlv-date>
    <label>label</label>
    <input type="date" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-date>

  <mlv-date>
    <label>disabled</label>
    <input type="date" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-date>

  <mlv-date>
    <label>success</label>
    <input type="date" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-date>

  <mlv-date>
    <label>error</label>
    <input type="date" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-date>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <mlv-date layout="horizontal">
    <label>label</label>
    <input type="date" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-date>

  <mlv-date layout="horizontal">
    <label>disabled</label>
    <input type="date" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-date>

  <mlv-date layout="horizontal">
    <label>success</label>
    <input type="date" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-date>

  <mlv-date layout="horizontal">
    <label>error</label>
    <input type="date" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-date>
</div>`
};

export const Range = {
  render: () => html`
<mlv-input-group>
  <label>date range</label>
  <mlv-date>
    <input type="date" aria-label="start date" value="2018-07-22" />
  </mlv-date>
  <mlv-date>
    <input type="date" aria-label="end date" value="2022-07-22" />
  </mlv-date>
  <mlv-control-message>message</mlv-control-message>
</mlv-input-group>
`
};

export const Types = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <mlv-date layout="horizontal">
    <label>date label</label>
    <input type="date" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-date>

  <mlv-datetime layout="horizontal">
    <label>datetime label</label>
    <input type="datetime-local" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-datetime>

  <mlv-month layout="horizontal">
    <label>month label</label>
    <input type="month" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-month>

  <mlv-week layout="horizontal">
    <label>week label</label>
    <input type="week" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-week>

  <mlv-time layout="horizontal">
    <label>time label</label>
    <input type="time" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-time>

  <mlv-input-group layout="horizontal">
    <label>date range</label>
    <mlv-date>
      <input type="date" aria-label="start date" value="2018-07-22" />
    </mlv-date>
    <mlv-date>
      <input type="date" aria-label="end date" value="2022-07-22" />
    </mlv-date>
    <mlv-control-message>message</mlv-control-message>
  </mlv-input-group>
</div>
`
}

export const FitText = {
  render: () => html`
<mlv-date fit-text>
  <label>date</label>
  <input type="date" value="2017-06-01" />
  <mlv-control-message>message</mlv-control-message>
</mlv-date>
`
};
