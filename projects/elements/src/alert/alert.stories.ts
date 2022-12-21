import { html } from 'lit';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert/Examples',
  component: 'mlv-alert',
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['undefined', 'accent', 'warning', 'danger', 'success']
    }
  }
};

type ArgTypes = Alert;

export const Default = {
  render: (args: ArgTypes) =>
    html`<mlv-alert .status=${args.status}>alert message</mlv-alert>`,
    args: { status: '' }
};

export const Status = {
  render: () => html`
    <div mlv-layout="column gap:md">
      <mlv-alert>default</mlv-alert>
      <mlv-alert status="warning">warning</mlv-alert>
      <mlv-alert status="success">success</mlv-alert>
      <mlv-alert status="danger">danger</mlv-alert>
    </div>
  `
}

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="column gap:md pad:md">
  <mlv-alert>default</mlv-alert>
  <mlv-alert status="warning">warning</mlv-alert>
  <mlv-alert status="success">success</mlv-alert>
  <mlv-alert status="danger">danger</mlv-alert>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
  <mlv-alert>default</mlv-alert>
  <mlv-alert status="warning">warning</mlv-alert>
  <mlv-alert status="success">success</mlv-alert>
  <mlv-alert status="danger">danger</mlv-alert>
</div>
  `
}
