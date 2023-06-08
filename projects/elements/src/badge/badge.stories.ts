import { html } from 'lit';
import '@elements/elements/badge/define.js';

export default {
  title: 'Elements/Badge/Examples',
  component: 'mlv-badge',
};

export const Default = {
  render: () => html`
  <mlv-badge status="starting">starting</mlv-badge>
  `
};

export const Status = {
  render: () => html`
<div mlv-layout="row gap:md">
  <mlv-badge status="scheduled">scheduled</mlv-badge>
  <mlv-badge status="queued">queued</mlv-badge>
  <mlv-badge status="pending">pending</mlv-badge>
  <mlv-badge status="starting">starting</mlv-badge>
  <mlv-badge status="running">running</mlv-badge>
  <mlv-badge status="restarting">restarting</mlv-badge>
  <mlv-badge status="stopping">stopping</mlv-badge>
  <mlv-badge status="finished">finished</mlv-badge>
  <mlv-badge status="failed">failed</mlv-badge>
  <mlv-badge status="unknown">unknown</mlv-badge>
</div>
  `
}

export const Support = {
  render: () => html`
<div mlv-layout="row gap:md">
  <mlv-badge status="accent">accent</mlv-badge>
  <mlv-badge status="warning">warning</mlv-badge>
  <mlv-badge status="success">success</mlv-badge>
  <mlv-badge status="danger">danger</mlv-badge>
</div>
  `
}

export const SupportLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-badge status="accent">accent</mlv-badge>
  <mlv-badge status="warning">warning</mlv-badge>
  <mlv-badge status="success">success</mlv-badge>
  <mlv-badge status="danger">danger</mlv-badge>
</div>
  `
}

export const SupportDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-badge status="accent">accent</mlv-badge>
  <mlv-badge status="warning">warning</mlv-badge>
  <mlv-badge status="success">success</mlv-badge>
  <mlv-badge status="danger">danger</mlv-badge>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-badge status="scheduled">scheduled</mlv-badge>
  <mlv-badge status="queued">queued</mlv-badge>
  <mlv-badge status="pending">pending</mlv-badge>
  <mlv-badge status="starting">starting</mlv-badge>
  <mlv-badge status="running">running</mlv-badge>
  <mlv-badge status="restarting">restarting</mlv-badge>
  <mlv-badge status="stopping">stopping</mlv-badge>
  <mlv-badge status="finished">finished</mlv-badge>
  <mlv-badge status="failed">failed</mlv-badge>
  <mlv-badge status="unknown">unknown</mlv-badge>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-badge status="scheduled">scheduled</mlv-badge>
  <mlv-badge status="queued">queued</mlv-badge>
  <mlv-badge status="pending">pending</mlv-badge>
  <mlv-badge status="starting">starting</mlv-badge>
  <mlv-badge status="running">running</mlv-badge>
  <mlv-badge status="restarting">restarting</mlv-badge>
  <mlv-badge status="stopping">stopping</mlv-badge>
  <mlv-badge status="finished">finished</mlv-badge>
  <mlv-badge status="failed">failed</mlv-badge>
  <mlv-badge status="unknown">unknown</mlv-badge>
</div>
  `
}

export const Trend = {
  render: () => html`
<div mlv-layout="row gap:md">
  <mlv-badge status="trend-neutral">+15%</mlv-badge>
  <mlv-badge status="trend-up">+15%</mlv-badge>
  <mlv-badge status="trend-down">-15%</mlv-badge>
</div>
  `
}

export const TrendLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md">
  <mlv-badge status="trend-neutral">+15%</mlv-badge>
  <mlv-badge status="trend-up">+15%</mlv-badge>
  <mlv-badge status="trend-down">-15%</mlv-badge>
</div>
  `
}

export const TrendDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md">
  <mlv-badge status="trend-neutral">+15%</mlv-badge>
  <mlv-badge status="trend-up">+15%</mlv-badge>
  <mlv-badge status="trend-down">-15%</mlv-badge>
</div>
  `
}