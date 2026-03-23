import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Forms',
  component: 'nve-input'
};

/**
 * @summary Input with action buttons for search and clear, providing quick access to common operations.
 */
export const SearchClear = {
  render: () => {
    return html`
<nve-input>
  <label>label</label>
  <nve-icon-button icon-name="search" container="flat" readonly></nve-icon-button>
  <input type="text" />
  <nve-icon-button icon-name="cancel" container="flat" aria-label="clear"></nve-icon-button>
  <nve-control-message>message</nve-control-message>
</nve-input>`
  }
}

/**
 * @summary Label with an information button to provide contextual help or more details about the field.
 */
export const LabelAction = {
  render: () => {
    return html`
<nve-input>
  <label>label</label>
  <nve-icon-button icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
  }
}

/**
 * @summary Input with prefix and suffix buttons to show fixed text elements like URL protocols and domains.
 */
export const PrefixSuffix = {
  render: () => {
    return html`
<nve-input>
  <label>label</label>
  <nve-button container="flat" readonly>https://</nve-button>
  <input type="text" />
  <nve-button container="flat" readonly>.com</nve-button>
  <nve-control-message>message</nve-control-message>
</nve-input>`
  }
}