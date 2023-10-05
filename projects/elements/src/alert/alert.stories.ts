import { html } from 'lit';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert/Examples',
  component: 'nve-alert'
};

type ArgTypes = Alert;

export const Default = {
  render: (args: ArgTypes) => html`<nve-alert .status=${args.status}>alert message</nve-alert>`
};

export const SupportStatus = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

export const SupportStatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

export const SupportStatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="finished">Finished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="ignored">Ignored</nve-alert>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="finished">Fnished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="finished">Finished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
</div>
  `
}
