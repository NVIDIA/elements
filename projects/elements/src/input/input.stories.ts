import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Input/Examples',
  component: 'nve-input',
  argTypes: {
    disabled: {
      control: 'boolean',
      defaultValue: false
    },
    status: {
      control: 'inline-radio',
      options: ['success', 'error', ''],
      defaultValue: ''
    },
    layout: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      defaultValue: 'vertical'
    }
  }
};

interface ArgTypes {
  status: 'success' | 'error',
  disabled: boolean;
  layout: 'vertical' | 'horizontal'
}

export const Default = {
  render: (args: ArgTypes) =>
    html`
<nve-input .layout=${args.layout}>
  <label>label</label>
  <input type="text" ?disabled=${args.disabled} />
  <nve-control-message .status=${args.status}>message</nve-control-message>
</nve-input>`,
};

export const Input = () => {
  return html`
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg">
  <nve-input>
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-input>

  <nve-input>
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-input>
</div>`
};

export const Horizontal = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-input layout="horizontal">
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-input>
</div>`
};

export const Rounded = {
  render: () => html`
<nve-input rounded>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};

export const FitText = {
  render: () => html`
<nve-input fit-text>
  <label>label</label>
  <input value="123456789012345678901234567890" />
  <nve-control-message>message</nve-control-message>
</nve-input>`
};
