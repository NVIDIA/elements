import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/date/define.js';
import '@elements/elements/datetime/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/month/define.js';
import '@elements/elements/week/define.js';
import '@elements/elements/time/define.js';

export default {
  title: 'Elements/Date/Examples',
  component: 'nve-date',
  parameters: { badges: ['alpha'] }
};

export const Date = {
  render: () => html`
<nve-date>
  <label>date</label>
  <input type="date" />
  <nve-control-message>message</nve-control-message>
</nve-date>
`
};

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
