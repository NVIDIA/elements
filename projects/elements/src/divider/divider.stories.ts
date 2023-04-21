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
<mlv-divider emphasis></mlv-divider>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md">
  <mlv-divider></mlv-divider>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md">
  <mlv-divider></mlv-divider>
</div>
  `
}
