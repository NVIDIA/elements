import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Input/Examples',
  component: 'mlv-input',
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
<mlv-input .layout=${args.layout}>
  <label>label</label>
  <input type="text" ?disabled=${args.disabled} />
  <mlv-control-message .status=${args.status}>message</mlv-control-message>
</mlv-input>`,
};

export const Input = () => {
  return html`
<mlv-input>
  <label>label</label>
  <input type="text" />
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const Vertical = () => {
  return html`
<div mlv-layout="column gap:lg">
  <mlv-input>
    <label>label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input>
    <label>disabled</label>
    <input disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input>
    <label>success</label>
    <input />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-input>

  <mlv-input>
    <label>error</label>
    <input />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-input>
</div>`
};

export const Horizontal = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-input layout="horizontal">
    <label>label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input layout="horizontal">
    <label>disabled</label>
    <input disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-input layout="horizontal">
    <label>success</label>
    <input />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-input>

  <mlv-input layout="horizontal">
    <label>error</label>
    <input />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-input>
</div>`
};

export const Rounded = {
  render: () => html`
<mlv-input rounded>
  <label>label</label>
  <input />
  <mlv-control-message>message</mlv-control-message>
</mlv-input>`
};

export const controlValidation = () => {
  return html`
<mlv-input>
  <label>validation</label>
  <input required />
  <mlv-control-message>message</mlv-control-message>
  <mlv-control-message error="valueMissing">required</mlv-control-message>
</mlv-input>`;
}
