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
  <mlv-alert>default</mlv-alert>
  <mlv-alert status="accent">accent</mlv-alert>
  <mlv-alert status="warning">warning</mlv-alert>
  <mlv-alert status="success">success</mlv-alert>
  <mlv-alert status="danger">danger</mlv-alert>
</div>
  `
}

export const SupportStatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="column gap:md pad:md">
  <mlv-alert>default</mlv-alert>
  <mlv-alert status="accent">accent</mlv-alert>
  <mlv-alert status="warning">warning</mlv-alert>
  <mlv-alert status="success">success</mlv-alert>
  <mlv-alert status="danger">danger</mlv-alert>
</div>
  `
}

export const SupportStatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
  <mlv-alert>default</mlv-alert>
  <mlv-alert status="accent">accent</mlv-alert>
  <mlv-alert status="warning">warning</mlv-alert>
  <mlv-alert status="success">success</mlv-alert>
  <mlv-alert status="danger">danger</mlv-alert>
</div>
  `
}

export const Status = {
  render: () => html`
<div mlv-layout="column gap:md">
  <mlv-alert status="scheduled">scheduled</mlv-alert>
  <mlv-alert status="queued">queued</mlv-alert>
  <mlv-alert status="finished">finished</mlv-alert>
  <mlv-alert status="failed">failed</mlv-alert>
  <mlv-alert status="unknown">unknown</mlv-alert>
  <mlv-alert status="pending">pending</mlv-alert>
  <mlv-alert status="starting">starting</mlv-alert>
  <mlv-alert status="running">running</mlv-alert>
  <mlv-alert status="restarting">restarting</mlv-alert>
  <mlv-alert status="stopping">stopping</mlv-alert>
  <mlv-alert status="ignored">ignored</mlv-alert>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="column gap:md pad:md">
  <mlv-alert status="scheduled">scheduled</mlv-alert>
  <mlv-alert status="queued">queued</mlv-alert>
  <mlv-alert status="pending">pending</mlv-alert>
  <mlv-alert status="starting">starting</mlv-alert>
  <mlv-alert status="running">running</mlv-alert>
  <mlv-alert status="restarting">restarting</mlv-alert>
  <mlv-alert status="stopping">stopping</mlv-alert>
  <mlv-alert status="finished">finished</mlv-alert>
  <mlv-alert status="failed">failed</mlv-alert>
  <mlv-alert status="unknown">unknown</mlv-alert>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
  <mlv-alert status="scheduled">scheduled</mlv-alert>
  <mlv-alert status="queued">queued</mlv-alert>
  <mlv-alert status="pending">pending</mlv-alert>
  <mlv-alert status="starting">starting</mlv-alert>
  <mlv-alert status="running">running</mlv-alert>
  <mlv-alert status="restarting">restarting</mlv-alert>
  <mlv-alert status="stopping">stopping</mlv-alert>
  <mlv-alert status="finished">finished</mlv-alert>
  <mlv-alert status="failed">failed</mlv-alert>
  <mlv-alert status="unknown">unknown</mlv-alert>
</div>
  `
}
