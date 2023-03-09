import { html } from 'lit';
import '@elements/elements/badge/define.js';

export default {
  title: 'Elements/Badge/Examples',
  component: 'nve-badge',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
  <nve-badge status="starting">starting</nve-badge>
  `
};

export const Status = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge status="scheduled">scheduled</nve-badge>
  <nve-badge status="queued">queued</nve-badge>
  <nve-badge status="pending">pending</nve-badge>
  <nve-badge status="starting">starting</nve-badge>
  <nve-badge status="running">running</nve-badge>
  <nve-badge status="restarting">restarting</nve-badge>
  <nve-badge status="stopping">stopping</nve-badge>
  <nve-badge status="finished">finished</nve-badge>
  <nve-badge status="failed">failed</nve-badge>
  <nve-badge status="unknown">unknown</nve-badge>
</div>
  `
}

export const Support = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge status="accent">accent</nve-badge>
  <nve-badge status="warning">warning</nve-badge>
  <nve-badge status="success">success</nve-badge>
  <nve-badge status="danger">danger</nve-badge>
</div>
  `
}

export const SupportLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md align:wrap">
  <nve-badge status="accent">accent</nve-badge>
  <nve-badge status="warning">warning</nve-badge>
  <nve-badge status="success">success</nve-badge>
  <nve-badge status="danger">danger</nve-badge>
</div>
  `
}

export const SupportDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md align:wrap">
  <nve-badge status="accent">accent</nve-badge>
  <nve-badge status="warning">warning</nve-badge>
  <nve-badge status="success">success</nve-badge>
  <nve-badge status="danger">danger</nve-badge>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md align:wrap">
  <nve-badge status="scheduled">scheduled</nve-badge>
  <nve-badge status="queued">queued</nve-badge>
  <nve-badge status="pending">pending</nve-badge>
  <nve-badge status="starting">starting</nve-badge>
  <nve-badge status="running">running</nve-badge>
  <nve-badge status="restarting">restarting</nve-badge>
  <nve-badge status="stopping">stopping</nve-badge>
  <nve-badge status="finished">finished</nve-badge>
  <nve-badge status="failed">failed</nve-badge>
  <nve-badge status="unknown">unknown</nve-badge>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md align:wrap">
  <nve-badge status="scheduled">scheduled</nve-badge>
  <nve-badge status="queued">queued</nve-badge>
  <nve-badge status="pending">pending</nve-badge>
  <nve-badge status="starting">starting</nve-badge>
  <nve-badge status="running">running</nve-badge>
  <nve-badge status="restarting">restarting</nve-badge>
  <nve-badge status="stopping">stopping</nve-badge>
  <nve-badge status="finished">finished</nve-badge>
  <nve-badge status="failed">failed</nve-badge>
  <nve-badge status="unknown">unknown</nve-badge>
</div>
  `
}

export const Trend = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge status="trend-neutral">+15%</nve-badge>  
  <nve-badge status="trend-up">+15%</nve-badge>
  <nve-badge status="trend-down">-15%</nve-badge>
</div>
  `
}

export const TrendLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md">
  <nve-badge status="trend-neutral">+15%</nve-badge>  
  <nve-badge status="trend-up">+15%</nve-badge>
  <nve-badge status="trend-down">-15%</nve-badge>
</div>
  `
}

export const TrendDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md">
  <nve-badge status="trend-neutral">+15%</nve-badge>  
  <nve-badge status="trend-up">+15%</nve-badge>
  <nve-badge status="trend-down">-15%</nve-badge>
</div>
  `
}