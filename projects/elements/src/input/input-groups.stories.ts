import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/date/define.js';
import '@elements/elements/dropdown/define.js';
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
    <nve-input-group type="filter">
      <nve-select style="width: 85px">
        <select>
          <option value="1">workload</option>
          <option value="2">instance</option>
        </select>
      </nve-select>
      <nve-select style="width: 70px">
        <select>
          <option value="1">sort by</option>
          <option value="2">filter by</option>
        </select>
      </nve-select>
      <nve-select style="width: 85px">
        <select>
          <option value="1">utilization</option>
          <option value="2">status</option>
        </select>
      </nve-select>
      <nve-icon-button aria-label="remove filter" icon-name="cancel"></nve-icon-button>
    </nve-input-group>
  </div>
  `
};

export const FilterGroupButtons = {
  render: () => html`
  <div nve-layout="row align:vertical-center">
    <nve-input-group type="filter">
      <nve-button style="width: 65px">GPS</nve-button>
      <nve-select style="width: 75px">
        <select>
          <option value="1">contains</option>
          <option value="2">excludes</option>
        </select>
      </nve-select>
      <nve-button style="width: 190px" id="map-btn">37.3706254,-121.9671894</nve-button>
      <nve-icon-button aria-label="remove filter" icon-name="cancel"></nve-icon-button>
    </nve-input-group>
    <nve-dropdown anchor="map-btn" trigger="map-btn">
      <nve-input>
        <nve-icon-button icon-name="location" readonly></nve-icon-button>
        <input value="37.3706254,-121.9671894" disabled />
      </nve-input>
      <img src="images/test-map-2.webp" width="300px" alt="non-interactive demo map" />  
    </nve-dropdown>
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
    <nve-date style="width:220px">
      <nve-button interaction="ghost" readonly="">start</nve-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </nve-date>
    <nve-date style="width:220px">
      <nve-button interaction="ghost" readonly="">end</nve-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </nve-date>
    <nve-icon-button aria-label="remove filter" icon-name="cancel"></nve-icon-button>
  </nve-input-group>
</div>
    `
}
