import { html } from 'lit';
import '@nvidia-elements/core/dot/define.js';

export default {
  title: 'Elements/Dot',
  component: 'nve-dot',
};

export const Default = {
  render: () => html`
<nve-dot status="starting"></nve-dot>
  `
};

export const Size = {
  render: () => html`
<div nve-layout="row gap:sm">
  <nve-dot size="sm">10</nve-dot>
  <nve-dot>10</nve-dot>
  <nve-dot size="lg">10</nve-dot>
</div>
<br>
<div nve-layout="row gap:lg">
  <nve-dot size="sm"></nve-dot>
  <nve-dot></nve-dot>
  <nve-dot size="lg"></nve-dot>
</div>
  `
}

export const SupportStatus = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot></nve-dot>
  <nve-dot status="accent"></nve-dot>
  <nve-dot status="warning"></nve-dot>
  <nve-dot status="success"></nve-dot>
  <nve-dot status="danger"></nve-dot>
</div>
  `
}

export const Number = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot>10</nve-dot>
  <nve-dot status="accent" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="warning" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="success" aria-label="10 notifications">10</nve-dot>
  <nve-dot status="danger" aria-label="10 notifications">10</nve-dot>
</div>
  `
}

export const Status = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-dot status="scheduled"></nve-dot>
  <nve-dot status="queued"></nve-dot>
  <nve-dot status="pending"></nve-dot>
  <nve-dot status="starting"></nve-dot>
  <nve-dot status="running"></nve-dot>
  <nve-dot status="restarting"></nve-dot>
  <nve-dot status="stopping"></nve-dot>
  <nve-dot status="finished"></nve-dot>
  <nve-dot status="failed"></nve-dot>
  <nve-dot status="unknown"></nve-dot>
</div>
  `
}

export const SupportLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md">
  <nve-dot></nve-dot>
  <nve-dot status="accent"></nve-dot>
  <nve-dot status="warning"></nve-dot>
  <nve-dot status="success"></nve-dot>
  <nve-dot status="danger"></nve-dot>
</div>
  `
}

export const SupportDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md">
  <nve-dot></nve-dot>
  <nve-dot status="accent"></nve-dot>
  <nve-dot status="warning"></nve-dot>
  <nve-dot status="success"></nve-dot>
  <nve-dot status="danger"></nve-dot>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md">
  <nve-dot status="scheduled"></nve-dot>
  <nve-dot status="queued"></nve-dot>
  <nve-dot status="pending"></nve-dot>
  <nve-dot status="starting"></nve-dot>
  <nve-dot status="running"></nve-dot>
  <nve-dot status="restarting"></nve-dot>
  <nve-dot status="stopping"></nve-dot>
  <nve-dot status="finished"></nve-dot>
  <nve-dot status="failed"></nve-dot>
  <nve-dot status="unknown"></nve-dot>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md">
  <nve-dot status="scheduled"></nve-dot>
  <nve-dot status="queued"></nve-dot>
  <nve-dot status="pending"></nve-dot>
  <nve-dot status="starting"></nve-dot>
  <nve-dot status="running"></nve-dot>
  <nve-dot status="restarting"></nve-dot>
  <nve-dot status="stopping"></nve-dot>
  <nve-dot status="finished"></nve-dot>
  <nve-dot status="failed"></nve-dot>
  <nve-dot status="unknown"></nve-dot>
</div>
  `
}