import { html } from 'lit';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert/Examples',
  component: 'mlv-alert',
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['warning', 'danger', 'success', 'info']
    }
  }
};

type ArgTypes = Alert & { };

export const Default = {
  render: (args: ArgTypes) =>
    html`<mlv-alert .status=${args.status}>alert message</mlv-alert>`,
    args: { status: 'info' }
};

export const Status = {
  render: () => html`
    <div mlv-layout="column gap:md">
      <mlv-alert status="info">info</mlv-alert>
      <mlv-alert status="warning">warning</mlv-alert>
      <mlv-alert status="success">success</mlv-alert>
      <mlv-alert status="danger">danger</mlv-alert>
    </div>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="light" mlv-layout="column gap:md">
      <mlv-alert status="info">info</mlv-alert>
      <mlv-alert status="warning">warning</mlv-alert>
      <mlv-alert status="success">success</mlv-alert>
      <mlv-alert status="danger">danger</mlv-alert>
    </div>
    <div mlv-theme="dark" mlv-layout="column gap:md">
      <mlv-alert status="info">info</mlv-alert>
      <mlv-alert status="warning">warning</mlv-alert>
      <mlv-alert status="success">success</mlv-alert>
      <mlv-alert status="danger">danger</mlv-alert>
    </div>
  `
}
