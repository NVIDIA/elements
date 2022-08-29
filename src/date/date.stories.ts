import { html } from 'lit';
import '@elements/elements/date/define.js';

export default {
  title: 'Forms/Date/Examples',
  component: 'mlv-date',
  parameters: { badges: ['alpha'] }
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
<div mlv-layout="column gap:lg align:stretch">
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
<div mlv-layout="column gap:lg align:stretch">
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
<div mlv-layout="column gap:lg align:stretch">
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
