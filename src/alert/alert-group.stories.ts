import { html } from 'lit';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert Group/Examples',
  component: 'nve-alert-group',
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['warning', 'danger', 'success', 'info', 'muted']
    }
  }
};

type ArgTypes = Alert & { };

export const Default = {
  render: (args: ArgTypes) =>
    html`
    <nve-alert-group .status=${args.status}>
      <nve-alert>alert message</nve-alert>
    </nve-alert-group>
    `,
    args: { status: 'info' }
};

export const Status = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group status="info">
        <nve-alert>info</nve-alert>
        <nve-alert>info</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

export const Closable = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group status="info">
        <nve-alert closable>info</nve-alert>
        <nve-alert closable>info</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert closable>warning</nve-alert>
        <nve-alert closable>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert closable>success</nve-alert>
        <nve-alert closable>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert closable>danger</nve-alert>
        <nve-alert closable>danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="light" nve-layout="column gap:md">
      <nve-alert-group status="info">
        <nve-alert>info</nve-alert>
        <nve-alert>info</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    </div>
    <div nve-theme="dark" nve-layout="column gap:md">
      <nve-alert-group status="info">
        <nve-alert>info</nve-alert>
        <nve-alert>info</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}
