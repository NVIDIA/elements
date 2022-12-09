import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Input Group/Examples',
  component: 'mlv-input-group',
  parameters: { badges: ['beta'] }
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
    <mlv-button interaction="ghost" readonly="">.com</mlv-button>
  </mlv-input>
  <mlv-control-message>host: 123456</mlv-control-message>
</mlv-input-group>
`
};

export const FilterGroup = {
  render: () => html`
  <div mlv-layout="row align:vertical-center">
    <mlv-input-group>
      <mlv-select style="width: 100px">
        <select>
          <option value="1">workload</option>
          <option value="1">instance</option>
        </select>
      </mlv-select>
      <mlv-select style="width: 100px">
        <select>
          <option value="2">sort by</option>
          <option value="1">filter by</option>
        </select>
      </mlv-select>
      <mlv-select style="width: 100px">
        <select>
          <option value="1">status</option>
          <option value="1">utilization</option>
        </select>
      </mlv-select>
    </mlv-input-group>
    <mlv-icon-button aria-label="remove filter" interaction="ghost" icon-name="cancel"></mlv-icon-button>
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
    <mlv-date style="width:225px">
      <mlv-button interaction="ghost" readonly="">start</mlv-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </mlv-date>
    <mlv-date style="width:225px">
      <mlv-button interaction="ghost" readonly="">end</mlv-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </mlv-date>
  </mlv-input-group>
  <mlv-icon-button aria-label="remove filter" interaction="ghost" icon-name="cancel"></mlv-icon-button>
</div>
    `
}