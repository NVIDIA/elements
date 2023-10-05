import { html } from 'lit';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert/Examples',
  component: 'mlv-alert'
};

type ArgTypes = Alert;

export const Default = {
  render: (args: ArgTypes) => html`<mlv-alert .status=${args.status}>alert message</mlv-alert>`
};

export const SupportStatus = {
  render: () => html`
<div mlv-layout="column gap:md">
  <mlv-alert>Standard</mlv-alert>
  <mlv-alert status="accent">Accent</mlv-alert>
  <mlv-alert status="warning">Warning</mlv-alert>
  <mlv-alert status="success">Success</mlv-alert>
  <mlv-alert status="danger">Danger</mlv-alert>
</div>
  `
}

export const SupportStatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="column gap:md pad:md">
  <mlv-alert>Standard</mlv-alert>
  <mlv-alert status="accent">Accent</mlv-alert>
  <mlv-alert status="warning">Warning</mlv-alert>
  <mlv-alert status="success">Success</mlv-alert>
  <mlv-alert status="danger">Danger</mlv-alert>
</div>
  `
}

export const SupportStatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
  <mlv-alert>Standard</mlv-alert>
  <mlv-alert status="accent">Accent</mlv-alert>
  <mlv-alert status="warning">Warning</mlv-alert>
  <mlv-alert status="success">Success</mlv-alert>
  <mlv-alert status="danger">Danger</mlv-alert>
</div>
  `
}

export const Status = {
  render: () => html`
<div mlv-layout="column gap:md">
  <mlv-alert status="scheduled">Scheduled</mlv-alert>
  <mlv-alert status="queued">Queued</mlv-alert>
  <mlv-alert status="finished">Finished</mlv-alert>
  <mlv-alert status="failed">Failed</mlv-alert>
  <mlv-alert status="unknown">Unknown</mlv-alert>
  <mlv-alert status="pending">Pending</mlv-alert>
  <mlv-alert status="starting">Starting</mlv-alert>
  <mlv-alert status="running">Running</mlv-alert>
  <mlv-alert status="restarting">Restarting</mlv-alert>
  <mlv-alert status="stopping">Stopping</mlv-alert>
  <mlv-alert status="ignored">Ignored</mlv-alert>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="column gap:md pad:md">
  <mlv-alert status="scheduled">Scheduled</mlv-alert>
  <mlv-alert status="queued">Queued</mlv-alert>
  <mlv-alert status="pending">Pending</mlv-alert>
  <mlv-alert status="starting">Starting</mlv-alert>
  <mlv-alert status="running">Running</mlv-alert>
  <mlv-alert status="restarting">Restarting</mlv-alert>
  <mlv-alert status="stopping">Stopping</mlv-alert>
  <mlv-alert status="finished">Fnished</mlv-alert>
  <mlv-alert status="failed">Failed</mlv-alert>
  <mlv-alert status="unknown">Unknown</mlv-alert>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
  <mlv-alert status="scheduled">Scheduled</mlv-alert>
  <mlv-alert status="queued">Queued</mlv-alert>
  <mlv-alert status="pending">Pending</mlv-alert>
  <mlv-alert status="starting">Starting</mlv-alert>
  <mlv-alert status="running">Running</mlv-alert>
  <mlv-alert status="restarting">Restarting</mlv-alert>
  <mlv-alert status="stopping">Stopping</mlv-alert>
  <mlv-alert status="finished">Finished</mlv-alert>
  <mlv-alert status="failed">Failed</mlv-alert>
  <mlv-alert status="unknown">Unknown</mlv-alert>
</div>
  `
}
