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
<div mlv-layout="row gap:md align:wrap">
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

export const Color = {
  render: () => html`
<div mlv-layout="row gap:xs align:wrap">
  <mlv-badge color="red-cardinal">red-cardinal</mlv-badge>
  <mlv-badge color="gray-slate">gray-slate</mlv-badge>
  <mlv-badge color="gray-denim">gray-denim</mlv-badge>
  <mlv-badge color="blue-indigo">blue-indigo</mlv-badge>
  <mlv-badge color="blue-cobalt">blue-cobalt</mlv-badge>
  <mlv-badge color="blue-sky">blue-sky</mlv-badge>
  <mlv-badge color="teal-cyan">teal-cyan</mlv-badge>
  <mlv-badge color="green-mint">green-mint</mlv-badge>
  <mlv-badge color="teal-seafoam">teal-seafoam</mlv-badge>
  <mlv-badge color="green-grass">green-grass</mlv-badge>
  <mlv-badge color="yellow-amber">yellow-amber</mlv-badge>
  <mlv-badge color="orange-pumpkin">orange-pumpkin</mlv-badge>
  <mlv-badge color="red-tomato">red-tomato</mlv-badge>
  <mlv-badge color="pink-magenta">pink-magenta</mlv-badge>
  <mlv-badge color="purple-plum">purple-plum</mlv-badge>
  <mlv-badge color="purple-violet">purple-violet</mlv-badge>
  <mlv-badge color="purple-lavender">purple-lavender</mlv-badge>
  <mlv-badge color="pink-rose">pink-rose</mlv-badge>
  <mlv-badge color="green-jade">green-jade</mlv-badge>
  <mlv-badge color="lime-pear">lime-pear</mlv-badge>
  <mlv-badge color="yellow-nova">yellow-nova</mlv-badge>
  <mlv-badge color="brand-green">brand-green</mlv-badge>
</div>
  `
};
