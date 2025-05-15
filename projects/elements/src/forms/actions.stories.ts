import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Forms',
  component: 'nve-input'
};

export const Actions = () => {
  return html`
<nve-input>
  <label>label</label>
  <nve-icon-button icon-name="search" container="flat" readonly></nve-icon-button>
  <input type="text" />
  <nve-icon-button icon-name="cancel" container="flat" aria-label="clear"></nve-icon-button>
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const LabelAction = () => {
  return html`
<nve-input>
  <label>label</label>
  <nve-icon-button icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const PrefixSuffix = () => {
  return html`
<nve-input>
  <label>label</label>
  <nve-button container="flat" readonly>https://</nve-button>
  <input type="text" />
  <nve-button container="flat" readonly>.com</nve-button>
  <nve-control-message>message</nve-control-message>
</nve-input>`
}