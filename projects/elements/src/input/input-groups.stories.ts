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
  component: 'mlv-input-group',
};

export const InputGroup = () => {
  return html`
<mlv-input-group>
  <label>domain</label>
  <mlv-select style="width: 130px">
    <select aria-label="protocol">
      <option>https://</option>
      <option>http://</option>
    </select>
  </mlv-select>
  <mlv-input>
    <input placeholder="example" type="url" aria-label="host" />
    <mlv-button interaction="flat" readonly="">.com</mlv-button>
  </mlv-input>
  <mlv-control-message>host: 123456</mlv-control-message>
</mlv-input-group>
`
};

export const FilterGroup = {
  render: () => html`
  <div mlv-layout="row align:vertical-center">
    <mlv-input-group type="filter">
      <mlv-select style="width: 85px">
        <select>
          <option value="1">workload</option>
          <option value="2">instance</option>
        </select>
      </mlv-select>
      <mlv-select style="width: 70px">
        <select>
          <option value="1">sort by</option>
          <option value="2">filter by</option>
        </select>
      </mlv-select>
      <mlv-select style="width: 85px">
        <select>
          <option value="1">utilization</option>
          <option value="2">status</option>
        </select>
      </mlv-select>
      <mlv-icon-button aria-label="remove filter" icon-name="cancel"></mlv-icon-button>
    </mlv-input-group>
  </div>
  `
};

export const FilterGroupButtons = {
  render: () => html`
  <div mlv-layout="row align:vertical-center">
    <mlv-input-group type="filter">
      <mlv-button style="width: 65px">GPS</mlv-button>
      <mlv-select style="width: 75px">
        <select>
          <option value="1">contains</option>
          <option value="2">excludes</option>
        </select>
      </mlv-select>
      <mlv-button style="width: 190px" id="map-btn">37.3706254,-121.9671894</mlv-button>
      <mlv-icon-button aria-label="remove filter" icon-name="cancel"></mlv-icon-button>
    </mlv-input-group>
    <mlv-dropdown anchor="map-btn" trigger="map-btn">
      <mlv-input>
        <mlv-icon-button icon-name="location" readonly></mlv-icon-button>
        <input value="37.3706254,-121.9671894" disabled />
      </mlv-input>
      <img src="images/test-map-2.webp" width="300px" alt="non-interactive demo map" />
    </mlv-dropdown>
    </div>
  `
};

export const FilterGroupRange = {
  render: () => html`
<div mlv-layout="row align:vertical-center">
  <mlv-input-group>
    <mlv-select style="width:150px">
      <select aria-label="date type">
        <option value="1">recording date</option>
        <option value="2">process date</option>
      </select>
    </mlv-select>
    <mlv-date style="width:220px">
      <mlv-button interaction="flat" readonly="">start</mlv-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </mlv-date>
    <mlv-date style="width:220px">
      <mlv-button interaction="flat" readonly="">end</mlv-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </mlv-date>
    <mlv-icon-button aria-label="remove filter" icon-name="cancel"></mlv-icon-button>
  </mlv-input-group>
</div>
    `
}
