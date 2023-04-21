import { html } from 'lit';
import '@elements/elements/divider/define.js';

export default {
  title: 'Elements/Divider/Examples',
  component: 'nve-divider',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
<nve-divider></nve-divider>
  `
};

export const Emphasis = {
  render: () => html`
<nve-divider emphasis></nve-divider>
  `
};

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md">
  <nve-divider></nve-divider>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md">
  <nve-divider></nve-divider>
</div>
  `
}
