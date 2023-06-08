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
  <nve-alert>default</nve-alert>
  <nve-alert status="accent">accent</nve-alert>
  <nve-alert status="warning">warning</nve-alert>
  <nve-alert status="success">success</nve-alert>
  <nve-alert status="danger">danger</nve-alert>
</div>
  `
}

export const SupportStatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert>default</nve-alert>
  <nve-alert status="accent">accent</nve-alert>
  <nve-alert status="warning">warning</nve-alert>
  <nve-alert status="success">success</nve-alert>
  <nve-alert status="danger">danger</nve-alert>
</div>
  `
}

export const SupportStatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert>default</nve-alert>
  <nve-alert status="accent">accent</nve-alert>
  <nve-alert status="warning">warning</nve-alert>
  <nve-alert status="success">success</nve-alert>
  <nve-alert status="danger">danger</nve-alert>
</div>
  `
}

export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert status="scheduled">scheduled</nve-alert>
  <nve-alert status="queued">queued</nve-alert>
  <nve-alert status="finished">finished</nve-alert>
  <nve-alert status="failed">failed</nve-alert>
  <nve-alert status="unknown">unknown</nve-alert>
  <nve-alert status="pending">pending</nve-alert>
  <nve-alert status="starting">starting</nve-alert>
  <nve-alert status="running">running</nve-alert>
  <nve-alert status="restarting">restarting</nve-alert>
  <nve-alert status="stopping">stopping</nve-alert>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert status="scheduled">scheduled</nve-alert>
  <nve-alert status="queued">queued</nve-alert>
  <nve-alert status="pending">pending</nve-alert>
  <nve-alert status="starting">starting</nve-alert>
  <nve-alert status="running">running</nve-alert>
  <nve-alert status="restarting">restarting</nve-alert>
  <nve-alert status="stopping">stopping</nve-alert>
  <nve-alert status="finished">finished</nve-alert>
  <nve-alert status="failed">failed</nve-alert>
  <nve-alert status="unknown">unknown</nve-alert>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert status="scheduled">scheduled</nve-alert>
  <nve-alert status="queued">queued</nve-alert>
  <nve-alert status="pending">pending</nve-alert>
  <nve-alert status="starting">starting</nve-alert>
  <nve-alert status="running">running</nve-alert>
  <nve-alert status="restarting">restarting</nve-alert>
  <nve-alert status="stopping">stopping</nve-alert>
  <nve-alert status="finished">finished</nve-alert>
  <nve-alert status="failed">failed</nve-alert>
  <nve-alert status="unknown">unknown</nve-alert>
</div>
  `
}
