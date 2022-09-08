import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Forms/Actions/Examples',
  component: 'nve-input'
};

export const Actions = () => {
  return html`
<nve-input>
  <label>label</label>
  <nve-icon-button icon-name="search" interaction="ghost" readonly></nve-icon-button>
  <input type="text" />
  <nve-icon-button icon-name="cancel" interaction="ghost" onClick="alert('click')" aria-label="clear"></nve-icon-button>
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const LabelAction = () => {
  return html`
<nve-input>
  <label>label</label>
  <nve-icon-button icon-name="information" interaction="ghost" aria-label="more details" slot="label" onClick="alert('more info')"></nve-icon-button>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const PrefixSuffix = () => {
  return html`
<nve-input>
  <label>label</label>
  <nve-button interaction="ghost" readonly>https://</nve-button>
  <input type="text" />
  <nve-button interaction="ghost" readonly>.com</nve-button>
  <nve-control-message>message</nve-control-message>
</nve-input>`
}