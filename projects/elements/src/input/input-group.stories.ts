import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/icon-button/define.js';

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
    <mlv-button container="flat" readonly="">.com</mlv-button>
  </mlv-input>
  <mlv-control-message>host: 123456</mlv-control-message>
</mlv-input-group>
`
};

export const FilterGroupRange = {
  render: () => html`
<div nve-layout="row align:vertical-center">
  <mlv-input-group>
    <mlv-select style="width:150px">
      <select aria-label="date type">
        <option value="1">recording date</option>
        <option value="2">process date</option>
      </select>
    </mlv-select>
    <mlv-date style="width:220px">
      <mlv-button container="flat" readonly="">start</mlv-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </mlv-date>
    <mlv-date style="width:220px">
      <mlv-button container="flat" readonly="">end</mlv-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </mlv-date>
    <mlv-icon-button aria-label="remove filter" icon-name="cancel"></mlv-icon-button>
  </mlv-input-group>
</div>
    `
}
