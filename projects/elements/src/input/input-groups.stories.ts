import { html } from 'lit';
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
