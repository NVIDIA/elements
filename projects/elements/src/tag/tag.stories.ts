import { html } from 'lit';
import '@elements/elements/tag/define.js';

export default {
  title: 'Elements/Tag/Examples',
  component: 'mlv-tag',
};

export const Default = {
  render: () => html`
  <mlv-tag>topic-tag</mlv-tag>
  `
};

export const Closable = {
  render: () => html`
<div mlv-layout="row gap:xs align:wrap">
  <mlv-tag closable>default-color</mlv-tag>
  <mlv-tag closable color="red-cardinal">red-cardinal</mlv-tag>
  <mlv-tag closable color="gray-slate">gray-slate</mlv-tag>
  <mlv-tag closable color="gray-denim">gray-denim</mlv-tag>
  <mlv-tag closable color="blue-indigo">blue-indigo</mlv-tag>
  <mlv-tag closable color="blue-cobalt">blue-cobalt</mlv-tag>
  <mlv-tag closable color="blue-sky">blue-sky</mlv-tag>
  <mlv-tag closable color="teal-cyan">teal-cyan</mlv-tag>
  <mlv-tag closable color="green-mint">green-mint</mlv-tag>
  <mlv-tag closable color="teal-seafoam">teal-seafoam</mlv-tag>
  <mlv-tag closable color="green-grass">green-grass</mlv-tag>
  <mlv-tag closable color="yellow-amber">yellow-amber</mlv-tag>
  <mlv-tag closable color="orange-pumpkin">orange-pumpkin</mlv-tag>
  <mlv-tag closable color="red-tomato">red-tomato</mlv-tag>
  <mlv-tag closable color="pink-magenta">pink-magenta</mlv-tag>
  <mlv-tag closable color="purple-plum">purple-plum</mlv-tag>
  <mlv-tag closable color="purple-violet">purple-violet</mlv-tag>
  <mlv-tag closable color="purple-lavender">purple-lavender</mlv-tag>
  <mlv-tag closable color="pink-rose">pink-rose</mlv-tag>
  <mlv-tag closable color="green-jade">green-jade</mlv-tag>
  <mlv-tag closable color="lime-pear">lime-pear</mlv-tag>
  <mlv-tag closable color="yellow-nova">yellow-nova</mlv-tag>
  <mlv-tag closable color="brand-green">brand-green</mlv-tag>
</div>
  `
};

export const Readonly = {
  render: () => html`
  <mlv-tag readonly>topic-tag</mlv-tag>
  `
};

export const Color = {
  render: () => html`
<div mlv-layout="row gap:xs align:wrap">
  <mlv-tag>default-color</mlv-tag>
  <mlv-tag color="red-cardinal">red-cardinal</mlv-tag>
  <mlv-tag color="gray-slate">gray-slate</mlv-tag>
  <mlv-tag color="gray-denim">gray-denim</mlv-tag>
  <mlv-tag color="blue-indigo">blue-indigo</mlv-tag>
  <mlv-tag color="blue-cobalt">blue-cobalt</mlv-tag>
  <mlv-tag color="blue-sky">blue-sky</mlv-tag>
  <mlv-tag color="teal-cyan">teal-cyan</mlv-tag>
  <mlv-tag color="green-mint">green-mint</mlv-tag>
  <mlv-tag color="teal-seafoam">teal-seafoam</mlv-tag>
  <mlv-tag color="green-grass">green-grass</mlv-tag>
  <mlv-tag color="yellow-amber">yellow-amber</mlv-tag>
  <mlv-tag color="orange-pumpkin">orange-pumpkin</mlv-tag>
  <mlv-tag color="red-tomato">red-tomato</mlv-tag>
  <mlv-tag color="pink-magenta">pink-magenta</mlv-tag>
  <mlv-tag color="purple-plum">purple-plum</mlv-tag>
  <mlv-tag color="purple-violet">purple-violet</mlv-tag>
  <mlv-tag color="purple-lavender">purple-lavender</mlv-tag>
  <mlv-tag color="pink-rose">pink-rose</mlv-tag>
  <mlv-tag color="green-jade">green-jade</mlv-tag>
  <mlv-tag color="lime-pear">lime-pear</mlv-tag>
  <mlv-tag color="yellow-nova">yellow-nova</mlv-tag>
  <mlv-tag color="brand-green">brand-green</mlv-tag>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:xs align:wrap pad:sm" style="background: var(--mlv-sys-layer-container-background) !important;">
  <mlv-tag>default-color</mlv-tag>
  <mlv-tag color="red-cardinal">red-cardinal</mlv-tag>
  <mlv-tag color="gray-slate">gray-slate</mlv-tag>
  <mlv-tag color="gray-denim">gray-denim</mlv-tag>
  <mlv-tag color="blue-indigo">blue-indigo</mlv-tag>
  <mlv-tag color="blue-cobalt">blue-cobalt</mlv-tag>
  <mlv-tag color="blue-sky">blue-sky</mlv-tag>
  <mlv-tag color="teal-cyan">teal-cyan</mlv-tag>
  <mlv-tag color="green-mint">green-mint</mlv-tag>
  <mlv-tag color="teal-seafoam">teal-seafoam</mlv-tag>
  <mlv-tag color="green-grass">green-grass</mlv-tag>
  <mlv-tag color="yellow-amber">yellow-amber</mlv-tag>
  <mlv-tag color="orange-pumpkin">orange-pumpkin</mlv-tag>
  <mlv-tag color="red-tomato">red-tomato</mlv-tag>
  <mlv-tag color="pink-magenta">pink-magenta</mlv-tag>
  <mlv-tag color="purple-plum">purple-plum</mlv-tag>
  <mlv-tag color="purple-violet">purple-violet</mlv-tag>
  <mlv-tag color="purple-lavender">purple-lavender</mlv-tag>
  <mlv-tag color="pink-rose">pink-rose</mlv-tag>
  <mlv-tag color="green-jade">green-jade</mlv-tag>
  <mlv-tag color="lime-pear">lime-pear</mlv-tag>
  <mlv-tag color="yellow-nova">yellow-nova</mlv-tag>
  <mlv-tag color="brand-green">brand-green</mlv-tag>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:xs align:wrap pad:sm">
  <mlv-tag>default-color</mlv-tag>
  <mlv-tag color="red-cardinal">red-cardinal</mlv-tag>
  <mlv-tag color="gray-slate">gray-slate</mlv-tag>
  <mlv-tag color="gray-denim">gray-denim</mlv-tag>
  <mlv-tag color="blue-indigo">blue-indigo</mlv-tag>
  <mlv-tag color="blue-cobalt">blue-cobalt</mlv-tag>
  <mlv-tag color="blue-sky">blue-sky</mlv-tag>
  <mlv-tag color="teal-cyan">teal-cyan</mlv-tag>
  <mlv-tag color="green-mint">green-mint</mlv-tag>
  <mlv-tag color="teal-seafoam">teal-seafoam</mlv-tag>
  <mlv-tag color="green-grass">green-grass</mlv-tag>
  <mlv-tag color="yellow-amber">yellow-amber</mlv-tag>
  <mlv-tag color="orange-pumpkin">orange-pumpkin</mlv-tag>
  <mlv-tag color="red-tomato">red-tomato</mlv-tag>
  <mlv-tag color="pink-magenta">pink-magenta</mlv-tag>
  <mlv-tag color="purple-plum">purple-plum</mlv-tag>
  <mlv-tag color="purple-violet">purple-violet</mlv-tag>
  <mlv-tag color="purple-lavender">purple-lavender</mlv-tag>
  <mlv-tag color="pink-rose">pink-rose</mlv-tag>
  <mlv-tag color="green-jade">green-jade</mlv-tag>
  <mlv-tag color="lime-pear">lime-pear</mlv-tag>
  <mlv-tag color="yellow-nova">yellow-nova</mlv-tag>
  <mlv-tag color="brand-green">brand-green</mlv-tag>
</div>
  `
}