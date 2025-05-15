import { html } from 'lit';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Tag',
  component: 'nve-tag',
};

export const Default = {
  render: () => html`
  <nve-tag>topic-tag</nve-tag>
  `
};

export const Closable = {
  render: () => html`
  <div nve-layout="row gap:xs align:wrap">
    <nve-tag closable>default-color</nve-tag>
    <nve-tag closable color="red-cardinal">red-cardinal</nve-tag>
    <nve-tag closable color="gray-slate">gray-slate</nve-tag>
    <nve-tag closable color="gray-denim">gray-denim</nve-tag>
    <nve-tag closable color="blue-indigo">blue-indigo</nve-tag>
    <nve-tag closable color="blue-cobalt">blue-cobalt</nve-tag>
    <nve-tag closable color="blue-sky">blue-sky</nve-tag>
    <nve-tag closable color="teal-cyan">teal-cyan</nve-tag>
    <nve-tag closable color="green-mint">green-mint</nve-tag>
    <nve-tag closable color="teal-seafoam">teal-seafoam</nve-tag>
    <nve-tag closable color="green-grass">green-grass</nve-tag>
    <nve-tag closable color="yellow-amber">yellow-amber</nve-tag>
    <nve-tag closable color="orange-pumpkin">orange-pumpkin</nve-tag>
    <nve-tag closable color="red-tomato">red-tomato</nve-tag>
    <nve-tag closable color="pink-magenta">pink-magenta</nve-tag>
    <nve-tag closable color="purple-plum">purple-plum</nve-tag>
    <nve-tag closable color="purple-violet">purple-violet</nve-tag>
    <nve-tag closable color="purple-lavender">purple-lavender</nve-tag>
    <nve-tag closable color="pink-rose">pink-rose</nve-tag>
    <nve-tag closable color="green-jade">green-jade</nve-tag>
    <nve-tag closable color="lime-pear">lime-pear</nve-tag>
    <nve-tag closable color="yellow-nova">yellow-nova</nve-tag>
    <nve-tag closable color="brand-green">brand-green</nve-tag>
  </div>
  `
};

export const Readonly = {
  render: () => html`
  <nve-tag readonly>topic-tag</nve-tag>
  `
};

export const TagGroup = {
  render: () => html`
   <div nve-layout="row gap:xs align:vertical-center">
    <nve-tag>topic-tag</nve-tag>
    <nve-tag>topic-tag</nve-tag>
    <nve-tag>topic-tag</nve-tag>
    <nve-tag>3+</nve-tag>

    <nve-icon-button container="flat" size="sm" icon-name="add"></nve-icon-button>
  </div>
  `
};

export const Color = {
  render: () => html`
<div nve-layout="row gap:xs align:wrap">
  <nve-tag>default-color</nve-tag>
  <nve-tag color="red-cardinal">red-cardinal</nve-tag>
  <nve-tag color="gray-slate">gray-slate</nve-tag>
  <nve-tag color="gray-denim">gray-denim</nve-tag>
  <nve-tag color="blue-indigo">blue-indigo</nve-tag>
  <nve-tag color="blue-cobalt">blue-cobalt</nve-tag>
  <nve-tag color="blue-sky">blue-sky</nve-tag>
  <nve-tag color="teal-cyan">teal-cyan</nve-tag>
  <nve-tag color="green-mint">green-mint</nve-tag>
  <nve-tag color="teal-seafoam">teal-seafoam</nve-tag>
  <nve-tag color="green-grass">green-grass</nve-tag>
  <nve-tag color="yellow-amber">yellow-amber</nve-tag>
  <nve-tag color="orange-pumpkin">orange-pumpkin</nve-tag>
  <nve-tag color="red-tomato">red-tomato</nve-tag>
  <nve-tag color="pink-magenta">pink-magenta</nve-tag>
  <nve-tag color="purple-plum">purple-plum</nve-tag>
  <nve-tag color="purple-violet">purple-violet</nve-tag>
  <nve-tag color="purple-lavender">purple-lavender</nve-tag>
  <nve-tag color="pink-rose">pink-rose</nve-tag>
  <nve-tag color="green-jade">green-jade</nve-tag>
  <nve-tag color="lime-pear">lime-pear</nve-tag>
  <nve-tag color="yellow-nova">yellow-nova</nve-tag>
  <nve-tag color="brand-green">brand-green</nve-tag>
</div>
  `
};

export const Prominence = {
  render: () => html`
<div nve-layout="row gap:xs align:wrap">
  <nve-tag prominence="emphasis" color="red-cardinal">red-cardinal</nve-tag>
  <nve-tag prominence="emphasis" color="gray-slate">gray-slate</nve-tag>
  <nve-tag prominence="emphasis" color="gray-denim">gray-denim</nve-tag>
  <nve-tag prominence="emphasis" color="blue-indigo">blue-indigo</nve-tag>
  <nve-tag prominence="emphasis" color="blue-cobalt">blue-cobalt</nve-tag>
  <nve-tag prominence="emphasis" color="blue-sky">blue-sky</nve-tag>
  <nve-tag prominence="emphasis" color="teal-cyan">teal-cyan</nve-tag>
  <nve-tag prominence="emphasis" color="green-mint">green-mint</nve-tag>
  <nve-tag prominence="emphasis" color="teal-seafoam">teal-seafoam</nve-tag>
  <nve-tag prominence="emphasis" color="green-grass">green-grass</nve-tag>
  <nve-tag prominence="emphasis" color="yellow-amber">yellow-amber</nve-tag>
  <nve-tag prominence="emphasis" color="orange-pumpkin">orange-pumpkin</nve-tag>
  <nve-tag prominence="emphasis" color="red-tomato">red-tomato</nve-tag>
  <nve-tag prominence="emphasis" color="pink-magenta">pink-magenta</nve-tag>
  <nve-tag prominence="emphasis" color="purple-plum">purple-plum</nve-tag>
  <nve-tag prominence="emphasis" color="purple-violet">purple-violet</nve-tag>
  <nve-tag prominence="emphasis" color="purple-lavender">purple-lavender</nve-tag>
  <nve-tag prominence="emphasis" color="pink-rose">pink-rose</nve-tag>
  <nve-tag prominence="emphasis" color="green-jade">green-jade</nve-tag>
  <nve-tag prominence="emphasis" color="lime-pear">lime-pear</nve-tag>
  <nve-tag prominence="emphasis" color="yellow-nova">yellow-nova</nve-tag>
  <nve-tag prominence="emphasis" color="brand-green">brand-green</nve-tag>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:xs align:wrap pad:sm" style="background: var(--nve-sys-layer-container-background) !important;">
  <nve-tag>default-color</nve-tag>
  <nve-tag color="red-cardinal">red-cardinal</nve-tag>
  <nve-tag color="gray-slate">gray-slate</nve-tag>
  <nve-tag color="gray-denim">gray-denim</nve-tag>
  <nve-tag color="blue-indigo">blue-indigo</nve-tag>
  <nve-tag color="blue-cobalt">blue-cobalt</nve-tag>
  <nve-tag color="blue-sky">blue-sky</nve-tag>
  <nve-tag color="teal-cyan">teal-cyan</nve-tag>
  <nve-tag color="green-mint">green-mint</nve-tag>
  <nve-tag color="teal-seafoam">teal-seafoam</nve-tag>
  <nve-tag color="green-grass">green-grass</nve-tag>
  <nve-tag color="yellow-amber">yellow-amber</nve-tag>
  <nve-tag color="orange-pumpkin">orange-pumpkin</nve-tag>
  <nve-tag color="red-tomato">red-tomato</nve-tag>
  <nve-tag color="pink-magenta">pink-magenta</nve-tag>
  <nve-tag color="purple-plum">purple-plum</nve-tag>
  <nve-tag color="purple-violet">purple-violet</nve-tag>
  <nve-tag color="purple-lavender">purple-lavender</nve-tag>
  <nve-tag color="pink-rose">pink-rose</nve-tag>
  <nve-tag color="green-jade">green-jade</nve-tag>
  <nve-tag color="lime-pear">lime-pear</nve-tag>
  <nve-tag color="yellow-nova">yellow-nova</nve-tag>
  <nve-tag color="brand-green">brand-green</nve-tag>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:xs align:wrap pad:sm">
  <nve-tag>default-color</nve-tag>
  <nve-tag color="red-cardinal">red-cardinal</nve-tag>
  <nve-tag color="gray-slate">gray-slate</nve-tag>
  <nve-tag color="gray-denim">gray-denim</nve-tag>
  <nve-tag color="blue-indigo">blue-indigo</nve-tag>
  <nve-tag color="blue-cobalt">blue-cobalt</nve-tag>
  <nve-tag color="blue-sky">blue-sky</nve-tag>
  <nve-tag color="teal-cyan">teal-cyan</nve-tag>
  <nve-tag color="green-mint">green-mint</nve-tag>
  <nve-tag color="teal-seafoam">teal-seafoam</nve-tag>
  <nve-tag color="green-grass">green-grass</nve-tag>
  <nve-tag color="yellow-amber">yellow-amber</nve-tag>
  <nve-tag color="orange-pumpkin">orange-pumpkin</nve-tag>
  <nve-tag color="red-tomato">red-tomato</nve-tag>
  <nve-tag color="pink-magenta">pink-magenta</nve-tag>
  <nve-tag color="purple-plum">purple-plum</nve-tag>
  <nve-tag color="purple-violet">purple-violet</nve-tag>
  <nve-tag color="purple-lavender">purple-lavender</nve-tag>
  <nve-tag color="pink-rose">pink-rose</nve-tag>
  <nve-tag color="green-jade">green-jade</nve-tag>
  <nve-tag color="lime-pear">lime-pear</nve-tag>
  <nve-tag color="yellow-nova">yellow-nova</nve-tag>
  <nve-tag color="brand-green">brand-green</nve-tag>
</div>
  `
}

export const OverflowSingle = {
  render: () => html`
  <nve-tag style="--width: 150px">some really long content</nve-tag>
  `
};


export const OverflowMaxWidth= {
  render: () => html`
  <style>
    .limit-width {
      --max-width: 100px;
    }
  </style>

  <nve-tag class="limit-width">two words</nve-tag>
  <nve-tag class="limit-width">three words here</nve-tag>
  <nve-tag class="limit-width">four words long here</nve-tag>
  `
};
