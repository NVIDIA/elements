import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/date/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Input Group/Examples',
  component: 'nve-input-group',
  parameters: { badges: ['beta'] }
};

export const InputGroup = () => {
  return html`
<nve-input-group>
  <label>domain</label>
  <nve-select style="width: 130px">
    <select aria-label="protocol">
      <option>https://</option>
      <option>http://</option>
    </select>
  </nve-select>
  <nve-input>
    <input placeholder="example" type="url" aria-label="host" />
    <nve-button interaction="ghost" readonly="">.com</nve-button>
  </nve-input>
  <nve-control-message>host: 123456</nve-control-message>
</nve-input-group>
`
};

export const FilterGroup = {
  render: () => html`
  <div nve-layout="row align:vertical-center">
    <nve-input-group>
      <nve-select style="width: 100px">
        <select>
          <option value="1">workload</option>
          <option value="1">instance</option>
        </select>
      </nve-select>
      <nve-select style="width: 100px">
        <select>
          <option value="2">sort by</option>
          <option value="1">filter by</option>
        </select>
      </nve-select>
      <nve-select style="width: 100px">
        <select>
          <option value="1">status</option>
          <option value="1">utilization</option>
        </select>
      </nve-select>
    </nve-input-group>
    <nve-icon-button aria-label="remove filter" interaction="ghost" icon-name="cancel"></nve-icon-button>
  </div>
  `
};

export const FilterGroupRange = {
  render: () => html`
<div nve-layout="row align:vertical-center">
  <nve-input-group>
    <nve-select style="width:150px">
      <select aria-label="date type">
        <option value="1">recording date</option>
        <option value="2">process date</option>
      </select>
    </nve-select>
    <nve-date style="width:225px">
      <nve-button interaction="ghost" readonly="">start</nve-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </nve-date>
    <nve-date style="width:225px">
      <nve-button interaction="ghost" readonly="">end</nve-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </nve-date>
  </nve-input-group>
  <nve-icon-button aria-label="remove filter" interaction="ghost" icon-name="cancel"></nve-icon-button>
</div>
    `
}