import { html } from 'lit';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert/Examples',
  component: 'nve-alert',
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
    html`<nve-alert .status=${args.status}>alert message</nve-alert>`,
    args: { status: '' }
};

export const Status = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert>default</nve-alert>
      <nve-alert status="warning">warning</nve-alert>
      <nve-alert status="success">success</nve-alert>
      <nve-alert status="danger">danger</nve-alert>
    </div>
  `
}

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert>default</nve-alert>
  <nve-alert status="warning">warning</nve-alert>
  <nve-alert status="success">success</nve-alert>
  <nve-alert status="danger">danger</nve-alert>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert>default</nve-alert>
  <nve-alert status="warning">warning</nve-alert>
  <nve-alert status="success">success</nve-alert>
  <nve-alert status="danger">danger</nve-alert>
</div>
  `
}
