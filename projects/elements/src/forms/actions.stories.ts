import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Foundations/Forms/Examples',
  component: 'mlv-input'
};

export const Actions = () => {
  return html`
<mlv-input>
  <label>label</label>
  <mlv-icon-button icon-name="search" container="flat" readonly></mlv-icon-button>
  <input type="text" />
  <mlv-icon-button icon-name="cancel" container="flat" aria-label="clear"></mlv-icon-button>
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const LabelAction = () => {
  return html`
<mlv-input>
  <label>label</label>
  <mlv-icon-button icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></mlv-icon-button>
  <input type="text" />
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const PrefixSuffix = () => {
  return html`
<mlv-input>
  <label>label</label>
  <mlv-button container="flat" readonly>https://</mlv-button>
  <input type="text" />
  <mlv-button container="flat" readonly>.com</mlv-button>
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
}