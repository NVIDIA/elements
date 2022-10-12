import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Form Actions/Examples',
  component: 'mlv-input'
};

export const Actions = () => {
  return html`
<mlv-input>
  <label>label</label>
  <mlv-icon-button icon-name="search" interaction="ghost" readonly></mlv-icon-button>
  <input type="text" />
  <mlv-icon-button icon-name="cancel" interaction="ghost" onClick="alert('click')" aria-label="clear"></mlv-icon-button>
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const LabelAction = () => {
  return html`
<mlv-input>
  <label>label</label>
  <mlv-icon-button icon-name="information" interaction="ghost" aria-label="more details" slot="label" onClick="alert('more info')"></mlv-icon-button>
  <input type="text" />
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const PrefixSuffix = () => {
  return html`
<mlv-input>
  <label>label</label>
  <mlv-button interaction="ghost" readonly>https://</mlv-button>
  <input type="text" />
  <mlv-button interaction="ghost" readonly>.com</mlv-button>
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
}