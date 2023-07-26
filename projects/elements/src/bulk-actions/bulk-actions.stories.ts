import { html } from 'lit';
import '@elements/elements/bulk-actions/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Elements/Bulk Actions/Examples',
  component: 'nve-bulk-actions',
};

export const Default = {
  render: () => html`
<div nve-theme="root" nve-layout="column gap:md">
  <nve-bulk-actions closable status="accent">
    123 selected
    <nve-button interaction="flat-destructive">delete</nve-button>
    <nve-icon-button interaction="flat" icon-name="more-actions"></nve-icon-button>
  </nve-bulk-actions>
  <nve-bulk-actions closable>
    123 selected
    <nve-button interaction="flat-destructive">delete</nve-button>
    <nve-icon-button interaction="flat" icon-name="more-actions"></nve-icon-button>
  </nve-bulk-actions>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:md pad:md">
  <nve-bulk-actions>
    123 selected
    <nve-button interaction="flat-destructive">delete</nve-button>
    <nve-icon-button interaction="flat" icon-name="more-actions"></nve-icon-button>
  </nve-bulk-actions>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:md pad:md">
  <nve-bulk-actions>
    123 selected
    <nve-button interaction="flat-destructive">delete</nve-button>
    <nve-icon-button interaction="flat" icon-name="more-actions"></nve-icon-button>
  </nve-bulk-actions>
</div>
  `
}
