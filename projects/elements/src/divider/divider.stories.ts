import { html } from 'lit';
import '@elements/elements/divider/define.js';

export default {
  title: 'Elements/Divider/Examples',
  component: 'mlv-divider',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
    <mlv-divider></mlv-divider>
  `
};

export const Emphasis = {
  render: () => html`
    <mlv-divider style="--color: var(--mlv-ref-border-color-emphasis)"></mlv-divider>
  `
};

export const Muted = {
  render: () => html`
    <mlv-divider style="--color: var(--mlv-ref-border-color-muted)"></mlv-divider>
  `
};

export const Vertical = {
  render: () => html`
    <div mlv-layout="row gap:sm align:vertical-center" style="height: 50px">
      <mlv-divider orientation="vertical"></mlv-divider>
      <mlv-icon-button icon-name="information"></mlv-icon-button>
      <mlv-icon-button icon-name="additional-actions"></mlv-icon-button>
    </div>
  `
};

export const Rounded = {
  render: () => html`
    <mlv-divider style="--size: var(--mlv-ref-border-width-xl); --border-radius: var(--mlv-ref-border-radius-xs); --color: var(--mlv-sys-accent-secondary-background);"></mlv-divider>
  `
};

export const LightTheme = {
  render: () => html`
    <mlv-card mlv-theme="light">
      <mlv-divider></mlv-divider>
    </mlv-card>
  `
}

export const DarkTheme = {
  render: () => html`
    <mlv-card mlv-theme="dark">
      <mlv-divider></mlv-divider>
    </mlv-card>
  `
}
