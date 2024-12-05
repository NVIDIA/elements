import { html } from 'lit';
import '@nvidia-elements/core/pulse/define.js';

export default {
  title: 'Elements/Pulse/Examples',
  component: 'nve-pulse',
};

export const Default = {
  render: () => html`
  <div nve-layout="row align:center">
      <nve-pulse aria-label="pulse component"></nve-pulse>
  </div>
`};

export const Status = {
    render: () => html`
      <div nve-layout="row gap:sm pad:md">
        <nve-pulse></nve-pulse>
        <nve-pulse status="accent"></nve-pulse>
        <nve-pulse status="warning"></nve-pulse>
        <nve-pulse status="danger"></nve-pulse>
      </div>
`};

export const Size = {
    render: () => html`
      <div nve-layout="row align:center">
        <nve-pulse size="xs"></nve-pulse>
        <nve-pulse size="sm"></nve-pulse>
        <nve-pulse size="md"></nve-pulse>
        <nve-pulse size="lg"></nve-pulse>
      </div>
`};

export const Inline = {
  render: () => html`
  <div nve-layout="row gap:xs align:center">
    <nve-pulse status="danger"></nve-pulse>
    Live Status
  </div>
  `
}