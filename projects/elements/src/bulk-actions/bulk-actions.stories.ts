import { html } from 'lit';
import '@elements/elements/bulk-actions/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Internal/Bulk Actions/Examples',
  component: 'mlv-bulk-actions',
};

export const Default = {
  render: () => html`
<div mlv-theme="root" mlv-layout="column gap:md">
  <mlv-bulk-actions closable status="accent">
    123 selected
    <mlv-button interaction="flat-destructive">delete</mlv-button>
    <mlv-icon-button interaction="flat" icon-name="more-actions"></mlv-icon-button>
  </mlv-bulk-actions>
  <mlv-bulk-actions closable>
    123 selected
    <mlv-button interaction="flat-destructive">delete</mlv-button>
    <mlv-icon-button interaction="flat" icon-name="more-actions"></mlv-icon-button>
  </mlv-bulk-actions>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md">
  <mlv-bulk-actions>
    123 selected
    <mlv-button interaction="flat-destructive">delete</mlv-button>
    <mlv-icon-button interaction="flat" icon-name="more-actions"></mlv-icon-button>
  </mlv-bulk-actions>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md">
  <mlv-bulk-actions>
    123 selected
    <mlv-button interaction="flat-destructive">delete</mlv-button>
    <mlv-icon-button interaction="flat" icon-name="more-actions"></mlv-icon-button>
  </mlv-bulk-actions>
</div>
  `
}
