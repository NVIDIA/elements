// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';

export default {
  title: 'Styles/Typography',
  component: 'nve-text'
};

/**
 * @summary Foundational text types (display, heading, body, label) for establishing visual hierarchy in the design system.
 * @tags priority
 */
export const Default = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="display">display</p>
  <p nve-text="heading">heading</p>
  <p nve-text="body">body</p>
  <p nve-text="label">label</p>
</div>
  `
}

/**
 * @summary Text types applied to semantic HTML heading elements for accessible content structure.
 * @tags priority
 */
export const Headings = {
  render: () => html`
<div nve-layout="column gap:lg">
  <h1 nve-text="display">display</h1>
  <h2 nve-text="heading">heading</h2>
  <h3 nve-text="body">body</h3>
  <h4 nve-text="label">label</h4>
</div>
  `
}

/**
 * @summary Displays the complete range of size modifiers for each text type, enabling precise typographic scale and size control.
 */
export const Size = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="display xl">display xl</p>
  <p nve-text="display lg">display lg</p>
  <p nve-text="display">display</p>
  <p nve-text="display sm">display sm</p>
  <p nve-text="heading xl">heading xl</p>
  <p nve-text="heading lg">heading lg</p>
  <p nve-text="heading">heading</p>
  <p nve-text="heading sm">heading sm</p>
  <p nve-text="heading xs">heading xs</p>
  <p nve-text="body xl">body xl</p>
  <p nve-text="body lg">body lg</p>
  <p nve-text="body">body</p>
  <p nve-text="body sm">body sm</p>
  <p nve-text="label xl">label xl</p>
  <p nve-text="label lg">label lg</p>
  <p nve-text="label">label</p>
  <p nve-text="label sm">label sm</p>
</div>
  `
}

/**
 * @summary Color variations for text to convey importance levels and ensure proper contrast in light and dark themes.
 * @tags test-case
 */
export const Color = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="body">default</p>
  <p nve-text="body emphasis">emphasis</p>
  <p nve-text="body muted">muted</p>
  <div nve-theme="root dark" nve-layout="column gap:lg">
    <p nve-text="body white">white</p>
  </div>
  <div nve-theme="root light" nve-layout="column gap:lg">
    <p nve-text="body black">black</p>
  </div>
</div>
  `
}

/**
 * @summary Available font weight options for creating visual emphasis and hierarchy within text content.
 */
export const Weights = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="body bold">bold</p>
  <p nve-text="body semibold">semibold</p>
  <p nve-text="body medium">medium</p>
  <p nve-text="body">default</p>
  <p nve-text="body light">light</p>
</div>
  `
}

/**
 * @summary Styled unordered list with consistent spacing and bullet markers.
 */
export const List = {
  render: () => html`
<ul nve-text="list">
  <li>list item 1</li>
  <li>list item 2</li>
  <li>list item 3</li>
  <li>Long line of text.. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</li>
</ul>
  `
}

/**
 * @summary Styled ordered list with sequential numbering for step-by-step or prioritized content.
 */
export const OrderedList = {
  render: () => html`
<ol nve-text="list">
  <li>list item</li>
  <li>list item</li>
  <li>list item</li>
</ol>
  `
}

/**
 * @summary Displays a list without bullets or default styling, useful for custom layouts or semantic markup without visual indicators.
 * @tags test-case
 */
export const UnstyledList = {
  render: () => html`
<ul nve-text="list unstyled">
  <li>list item</li>
  <li>list item</li>
  <li>list item</li>
</ul>
  `
}
/**
 * @summary Presents a navigation-optimized list with nested structure, ideal for sidebars and table of contents.
 * @tags test-case
 */
export const NavList = {
  render: () => html`
<ul nve-text="list nav">
  <li><a nve-text="link" href="#navigation-list">Welcome</a></li>

  <li><a nve-text="link" href="#navigation-list" aria-current="page">Installation</a></li>
  <li>
    <ul nve-text="list">
      <li><a nve-text="link" href="#navigation-list">Installing Dependencies</a></li>
      <li><a nve-text="link" href="#navigation-list">Configure Library</a></li>
    </ul>
  </li>

  <li><a nve-text="link" href="#navigation-list">Basic Usage</a></li>
  <li>
    <ul nve-text="list">
      <li><a nve-text="link" href="#navigation-list">Architecture</a></li>
      <li><a nve-text="link" href="#navigation-list">Reference</a></li>
      <li><a nve-text="link" href="#navigation-list">API</a></li>
    </ul>
  </li>

  <li>External Links</li>
  <li>
    <ul nve-text="list">
      <li><a nve-text="link" href="#navigation-list">Join the Community</a></li>

      <li>Submit an Issue</li>
      <li>
        <ul nve-text="list">
          <li><a nve-text="link" href="#navigation-list">Feature</a></li>
          <li><a nve-text="link" href="#navigation-list">Fix</a></li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
  `
}

/**
 * @summary Link styles including states, emphasis levels, and sizes for clear interactive affordances.
 * @tags test-case
 */
export const Link = {
  render: () => html`
<div nve-layout="column gap:lg">
  <a nve-text="body link" href="#">link</a>
  <a nve-text="body link hover" href="#">link (hover)</a>
  <a nve-text="body link visited" href="#">link (visited)</a>

  <nve-divider></nve-divider>

  <a nve-text="link" href="#">link</a>
  <a nve-text="link muted" href="#">link muted</a>
  <a nve-text="link emphasis" href="#">link emphasis</a>

  <nve-divider></nve-divider>
  
  <a nve-text="link sm" href="#">link sm</a>
  <a nve-text="link" href="#">link</a>
  <a nve-text="link lg" href="#">link lg</a>
  <a nve-text="link xl" href="#">link xl</a>

</div>
  `
}

/**
 * @summary Text transformation utilities for case changes and truncation to handle overflow gracefully.
 */
export const Transforms = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="body uppercase">uppercase</p>
  <p nve-text="body lowercase">LOWERCASE</p>
  <p nve-text="body capitalize">capitalize</p>
  <p nve-text="body truncate" style="width: 350px;">truncate: dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi</p>
</div>
  `
}

/**
 * @summary Relative line height options that scale with font size, optimizing readability for different text densities.
 * @tags test-case
 */
export const LineHeightRelative = {
  render: () => html`
<div nve-layout="column">
  <p nve-text="tight">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="snug">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="moderate">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</div>
  `
}

/**
 * @summary Displays fixed line height values for precise vertical rhythm control independent of font size changes.
 * @tags test-case
 */
export const LineHeightFixed = {
  render: () => html`
<div nve-layout="column">
  <p nve-text="line-height-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-7">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-9">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p nve-text="line-height-10">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</div>
  `
}

/**
 * @summary Description list layout with consistent spacing and typography styles.
 */
export const DescriptionList = {
  render: () => html`
<dl nve-layout="column gap:md">
  <dt nve-text="body muted medium">Knot</dt>
  <dd nve-text="body">Knot is a unit of speed equaling 1 nautical mile per hour.</dd>

  <dt nve-text="body muted medium">Port</dt>
  <dd nve-text="body">Port is the nautical term that refers to the left side of a ship, as perceived by a person facing towards the bow (the front of the vessel).</dd>

  <dt nve-text="body muted medium">Starboard</dt>
  <dd nve-text="body">Starboard is the nautical term that refers to the right side of a vessel, as perceived by a person facing towards the bow (the front of the vessel).</dd>
</dl>
  `
}
