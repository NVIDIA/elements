import { html } from 'lit';
import '@elements/elements/sort-button/define.js';

export default {
  title: 'Elements/Sort Button/Examples',
  component: 'nve-sort-button',
  parameters: { badges: ['alpha'] }
};

export const Default = {
  render: () => html`
  <nve-sort-button></nve-sort-button>
  `
};

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md align:wrap">
  <nve-sort-button></nve-sort-button>
  <nve-sort-button sort="ascending"></nve-sort-button>
  <nve-sort-button sort="descending"></nve-sort-button>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md align:wrap">
  <nve-sort-button></nve-sort-button>
  <nve-sort-button sort="ascending"></nve-sort-button>
  <nve-sort-button sort="descending"></nve-sort-button>
</div>
  `
}