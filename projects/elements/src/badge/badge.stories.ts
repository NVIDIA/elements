import { html } from 'lit';
import '@elements/elements/badge/define.js';

export default {
  title: 'Elements/Badge/Examples',
  component: 'nve-badge',
};

export const Default = {
  render: () => html`
  <nve-badge status="starting">starting</nve-badge>
  `
};

export const Status = {
  render: () => html`
<div nve-layout="row gap:md align:wrap">
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
  <nve-badge status="ignored">ignored</nve-badge>
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
  <nve-badge status="ignored">ignored</nve-badge>
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
  <nve-badge status="ignored">ignored</nve-badge>
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

export const Color = {
  render: () => html`
<div nve-layout="row gap:xs align:wrap">
  <nve-badge color="red-cardinal">red-cardinal</nve-badge>
  <nve-badge color="gray-slate">gray-slate</nve-badge>
  <nve-badge color="gray-denim">gray-denim</nve-badge>
  <nve-badge color="blue-indigo">blue-indigo</nve-badge>
  <nve-badge color="blue-cobalt">blue-cobalt</nve-badge>
  <nve-badge color="blue-sky">blue-sky</nve-badge>
  <nve-badge color="teal-cyan">teal-cyan</nve-badge>
  <nve-badge color="green-mint">green-mint</nve-badge>
  <nve-badge color="teal-seafoam">teal-seafoam</nve-badge>
  <nve-badge color="green-grass">green-grass</nve-badge>
  <nve-badge color="yellow-amber">yellow-amber</nve-badge>
  <nve-badge color="orange-pumpkin">orange-pumpkin</nve-badge>
  <nve-badge color="red-tomato">red-tomato</nve-badge>
  <nve-badge color="pink-magenta">pink-magenta</nve-badge>
  <nve-badge color="purple-plum">purple-plum</nve-badge>
  <nve-badge color="purple-violet">purple-violet</nve-badge>
  <nve-badge color="purple-lavender">purple-lavender</nve-badge>
  <nve-badge color="pink-rose">pink-rose</nve-badge>
  <nve-badge color="green-jade">green-jade</nve-badge>
  <nve-badge color="lime-pear">lime-pear</nve-badge>
  <nve-badge color="yellow-nova">yellow-nova</nve-badge>
  <nve-badge color="brand-green">brand-green</nve-badge>
</div>
  `
};
