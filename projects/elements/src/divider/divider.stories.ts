import { html } from 'lit';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Divider',
  component: 'nve-divider',
};

export const Default = {
  render: () => html`
    <nve-divider></nve-divider>
  `
};

export const Emphasis = {
  render: () => html`
    <nve-divider style="--color: var(--nve-ref-border-color-emphasis)"></nve-divider>
  `
};

export const Muted = {
  render: () => html`
    <nve-divider style="--color: var(--nve-ref-border-color-muted)"></nve-divider>
  `
};

export const Vertical = {
  render: () => html`
    <div nve-layout="row gap:sm align:vertical-center" style="height: 50px">
      <nve-divider orientation="vertical"></nve-divider>
      <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
      <nve-icon-button icon-name="more-actions"></nve-icon-button>
    </div>
  `
};

export const Rounded = {
  render: () => html`
    <nve-divider style="--size: var(--nve-ref-border-width-xl); --border-radius: var(--nve-ref-border-radius-xs); --color: var(--nve-sys-accent-secondary-background);"></nve-divider>
  `
};

export const LightTheme = {
  render: () => html`
    <nve-card nve-theme="light">
      <nve-divider></nve-divider>
    </nve-card>
  `
}

export const DarkTheme = {
  render: () => html`
    <nve-card nve-theme="dark">
      <nve-divider></nve-divider>
    </nve-card>
  `
}
