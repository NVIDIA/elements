// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Elements/Tag',
  component: 'nve-tag',
};

/**
 * @summary Basic tag component for interactive labeling and categorizing of content, providing clear visual organization and metadata display.
 */
export const Default = {
  render: () => html`
<nve-tag>topic-tag</nve-tag>`
};

/**
 * @summary Closable tags with comprehensive color palette, enabling user interaction for filtering, selection, and dynamic content management.
 * @tags test-case
 */
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
</div>`
};

/**
 * @summary Read-only tags for displaying static labels and metadata, providing visual context without user interaction capabilities.
 * @tags test-case
 */
export const Readonly = {
  render: () => html`
<nve-tag readonly>topic-tag</nve-tag>`
};

/**
 * @summary Tag group layout with overflow handling and add functionality, ideal for managing many categories with space constraints.
 */
export const Group = {
  render: () => html`
<div nve-layout="row gap:xs align:vertical-center">
  <nve-tag>topic-tag</nve-tag>
  <nve-tag>topic-tag</nve-tag>
  <nve-tag>topic-tag</nve-tag>
  <nve-tag>3+</nve-tag>
  <nve-icon-button container="flat" size="sm" icon-name="add"></nve-icon-button>
</div>`
};

/**
 * @summary Comprehensive color palette for tag backgrounds, enabling visual categorization and brand consistency across different content types.
 * @tags test-case
 */
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

/**
 * @summary High prominence tags with emphasis styling for important categories and priority labels that require visual attention.
 * @tags test-case
 */
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
</div>`
};

/**
 * @summary Tag with icon, showing how the icon/dot color inherits the tag color.
 * @tags test-case
 */
export const SlottedColor = {
  render: () => html`
<div nve-layout="row gap:xs align:wrap">
  <nve-tag style="--max-width: 100px"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> very words long here <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag><nve-icon slot="prefix" name="person" size="sm"></nve-icon> default <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="red-cardinal"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> red-cardinal <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="gray-slate"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> gray-slate <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="gray-denim"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> gray-denim <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="blue-indigo"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> blue-indigo <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="blue-cobalt"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> blue-cobalt <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="blue-sky"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> blue-sky <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="teal-cyan"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> teal-cyan <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="green-mint"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> green-mint <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="teal-seafoam"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> teal-seafoam <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="green-grass"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> green-grass <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="yellow-amber"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> yellow-amber <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="orange-pumpkin"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> orange-pumpkin <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="red-tomato"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> red-tomato <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="pink-magenta"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> pink-magenta <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="purple-plum"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> purple-plum <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="purple-violet"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> purple-violet <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="purple-lavender"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> purple-lavender <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="pink-rose"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> pink-rose <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="green-jade"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> green-jade <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="lime-pear"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> lime-pear <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="yellow-nova"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> yellow-nova <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
  <nve-tag color="brand-green"><nve-icon slot="prefix" name="person" size="sm"></nve-icon> brand-green <nve-dot slot="suffix" size="sm">10</nve-dot></nve-tag>
</div>
  `
};

/**
 * @summary Single tag with constrained width, with text overflow behavior and content truncation in limited space.
 * @tags test-case
 */
export const OverflowSingle = {
  render: () => html`
<nve-tag style="--width: 150px">some really long content</nve-tag>`
};


/**
 * @summary Many tags with max width constraints, showing how content adapts to space limitations and maintains visual consistency.
 * @tags test-case
 */
export const OverflowMaxWidth= {
  render: () => html`
  <style>
    .limit-width {
      --max-width: 100px;
    }
  </style>
  <nve-tag class="limit-width">two words</nve-tag>
  <nve-tag class="limit-width">three words here</nve-tag>
  <nve-tag class="limit-width">four words long here</nve-tag>`
};
