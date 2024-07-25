import { html } from 'lit';
import '@nvidia-elements/core/dot/define.js';

export default {
  title: 'Elements/Dot/Examples',
  component: 'mlv-dot',
};

export const Default = {
  render: () => html`
<mlv-dot status="starting"></mlv-dot>
  `
};

export const Size = {
  render: () => html`
<div nve-layout="row gap:sm">
  <mlv-dot size="sm">10</mlv-dot>
  <mlv-dot>10</mlv-dot>
  <mlv-dot size="lg">10</mlv-dot>
</div>
<br>
<div nve-layout="row gap:lg">
  <mlv-dot size="sm"></mlv-dot>
  <mlv-dot></mlv-dot>
  <mlv-dot size="lg"></mlv-dot>
</div>
  `
}

export const SupportStatus = {
  render: () => html`
<div nve-layout="row gap:md">
  <mlv-dot></mlv-dot>
  <mlv-dot status="accent"></mlv-dot>
  <mlv-dot status="warning"></mlv-dot>
  <mlv-dot status="success"></mlv-dot>
  <mlv-dot status="danger"></mlv-dot>
</div>
  `
}

export const Number = {
  render: () => html`
<div nve-layout="row gap:md">
  <mlv-dot>10</mlv-dot>
  <mlv-dot status="accent" aria-label="10 notifications">10</mlv-dot>
  <mlv-dot status="warning" aria-label="10 notifications">10</mlv-dot>
  <mlv-dot status="success" aria-label="10 notifications">10</mlv-dot>
  <mlv-dot status="danger" aria-label="10 notifications">10</mlv-dot>
</div>
  `
}

export const Status = {
  render: () => html`
<div nve-layout="row gap:md">
  <mlv-dot status="scheduled"></mlv-dot>
  <mlv-dot status="queued"></mlv-dot>
  <mlv-dot status="pending"></mlv-dot>
  <mlv-dot status="starting"></mlv-dot>
  <mlv-dot status="running"></mlv-dot>
  <mlv-dot status="restarting"></mlv-dot>
  <mlv-dot status="stopping"></mlv-dot>
  <mlv-dot status="finished"></mlv-dot>
  <mlv-dot status="failed"></mlv-dot>
  <mlv-dot status="unknown"></mlv-dot>
</div>
  `
}

export const SupportLightTheme = {
  render: () => html`
<div mlv-theme="root light" nve-layout="row gap:md pad:md">
  <mlv-dot></mlv-dot>
  <mlv-dot status="accent"></mlv-dot>
  <mlv-dot status="warning"></mlv-dot>
  <mlv-dot status="success"></mlv-dot>
  <mlv-dot status="danger"></mlv-dot>
</div>
  `
}

export const SupportDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" nve-layout="row gap:md pad:md">
  <mlv-dot></mlv-dot>
  <mlv-dot status="accent"></mlv-dot>
  <mlv-dot status="warning"></mlv-dot>
  <mlv-dot status="success"></mlv-dot>
  <mlv-dot status="danger"></mlv-dot>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" nve-layout="row gap:md pad:md">
  <mlv-dot status="scheduled"></mlv-dot>
  <mlv-dot status="queued"></mlv-dot>
  <mlv-dot status="pending"></mlv-dot>
  <mlv-dot status="starting"></mlv-dot>
  <mlv-dot status="running"></mlv-dot>
  <mlv-dot status="restarting"></mlv-dot>
  <mlv-dot status="stopping"></mlv-dot>
  <mlv-dot status="finished"></mlv-dot>
  <mlv-dot status="failed"></mlv-dot>
  <mlv-dot status="unknown"></mlv-dot>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" nve-layout="row gap:md pad:md">
  <mlv-dot status="scheduled"></mlv-dot>
  <mlv-dot status="queued"></mlv-dot>
  <mlv-dot status="pending"></mlv-dot>
  <mlv-dot status="starting"></mlv-dot>
  <mlv-dot status="running"></mlv-dot>
  <mlv-dot status="restarting"></mlv-dot>
  <mlv-dot status="stopping"></mlv-dot>
  <mlv-dot status="finished"></mlv-dot>
  <mlv-dot status="failed"></mlv-dot>
  <mlv-dot status="unknown"></mlv-dot>
</div>
  `
}