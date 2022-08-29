import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Forms/Input Group/Examples',
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
