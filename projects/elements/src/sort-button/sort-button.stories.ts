import { html } from 'lit';
import '@nvidia-elements/core/sort-button/define.js';

export default {
  title: 'Elements/Sort Button',
  component: 'nve-sort-button',
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