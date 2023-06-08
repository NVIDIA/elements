import { html } from 'lit';
import '@elements/elements/sort-button/define.js';

export default {
  title: 'Elements/Sort Button/Examples',
  component: 'mlv-sort-button',
};

export const Default = {
  render: () => html`
  <mlv-sort-button></mlv-sort-button>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-sort-button></mlv-sort-button>
  <mlv-sort-button sort="ascending"></mlv-sort-button>
  <mlv-sort-button sort="descending"></mlv-sort-button>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-sort-button></mlv-sort-button>
  <mlv-sort-button sort="ascending"></mlv-sort-button>
  <mlv-sort-button sort="descending"></mlv-sort-button>
</div>
  `
}