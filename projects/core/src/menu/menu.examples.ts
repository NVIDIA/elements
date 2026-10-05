// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/page/define.js';

export default {
  title: 'Elements/Menu',
  component: 'nve-menu'
};

/**
 * @summary Basic menu with simple text items for the default menu structure and styling.
 */
export const Default = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu items with content slots for icons, dots, and other elements.
 * @tags test-case
 */
export const ContentSlots = {
  render: () => html`
    <nve-menu>
      <nve-menu-item><nve-icon name="code" slot="prefix"></nve-icon> Code <nve-dot slot="suffix" size="sm"></nve-dot></nve-menu-item>
      <nve-menu-item><nve-icon name="checklist" slot="prefix"></nve-icon> Lint <nve-dot slot="suffix" status="accent" size="sm"></nve-dot></nve-menu-item>
      <nve-menu-item><nve-icon name="terminal" slot="prefix"></nve-icon> CLI <nve-dot slot="suffix" status="success" size="sm"></nve-dot></nve-menu-item>
      <nve-menu-item><nve-icon name="person" slot="prefix"></nve-icon> Profile <nve-dot slot="suffix" status="warning" size="sm"></nve-dot></nve-menu-item>
      <nve-menu-item><nve-icon name="key" slot="prefix"></nve-icon> Access <nve-dot slot="suffix" status="danger" size="sm"></nve-dot></nve-menu-item>
    </nve-menu>
  `
};

/**
 * @summary Dynamically toggle the compact state of a menu.
 * @tags test-case
 */
export const Compact = {
  render: () => html`
    <nve-switch>
      <label>Compact</label>
      <input id="compact-switch" type="checkbox" aria-label="compact menu" checked />
    </nve-switch>
    <nve-menu density="compact" id="compact-menu">
      <nve-menu-item><nve-icon name="code" slot="prefix"></nve-icon> Code</nve-menu-item>
      <nve-menu-item><nve-icon name="checklist" slot="prefix"></nve-icon> Lint</nve-menu-item>
      <nve-menu-item><nve-icon name="terminal" slot="prefix"></nve-icon> CLI</nve-menu-item>
      <nve-menu-item><nve-icon name="person" slot="prefix"></nve-icon> Profile</nve-menu-item>
      <nve-menu-item><nve-icon name="key" slot="prefix"></nve-icon> Access</nve-menu-item>
    </nve-menu>
    <script type="module">
      document.querySelector('#compact-switch').addEventListener('change', e => {
        document.querySelector('#compact-menu').density = e.target.checked ? 'compact' : 'default';
      });  
    </script>
  `
};

/**
 * @summary An explicitly expanded group keeps navigation state controlled by the application without enabling automatic state changes. Use when the application owns expansion state.
 */
export const ExpandedNavigation = {
  render: () => html`
    <nve-menu-group expanded style="--width: 240px">
      Resources
      <nve-menu>
        <nve-menu-item>Documentation</nve-menu-item>
        <nve-menu-item>Examples</nve-menu-item>
      </nve-menu>
    </nve-menu-group>
  `
};

/**
 * @summary A disabled menu-group header preserves its current expanded content while preventing user toggling. Use when group availability depends on application state.
 */
export const UnavailableNavigation = {
  render: () => html`
    <nve-menu-group expanded disabled style="--width: 240px">
      Provisioning
      <nve-menu>
        <nve-menu-item>Clusters</nve-menu-item>
        <nve-menu-item>Storage</nve-menu-item>
      </nve-menu>
    </nve-menu-group>
  `
};

/**
 * @summary Menu with keyboard navigation and ARIA disclosure pattern inside a dropdown. Use when menu items need accessible focus management and arrow key navigation.
 * @tags pattern
 */
export const Dropdown = {
  render: () => html`
  <nve-button popovertarget="dropdown-menu">dropdown</nve-button>
  <nve-dropdown id="dropdown-menu">
    <nve-menu>
      <nve-menu-item><nve-icon name="person"></nve-icon> profile</nve-menu-item>
      <nve-menu-item><nve-icon name="gear"></nve-icon> settings</nve-menu-item>
      <nve-menu-item><nve-icon name="star"></nve-icon> favorites</nve-menu-item>
      <nve-divider></nve-divider>
      <nve-menu-item><nve-icon name="logout"></nve-icon> logout</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  `
};

/**
 * @summary Menu with a selected item showing the visual state for user-selected options.
 */
export const Selected = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item selected>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with a current page item showing the visual state for the active/current page in navigation.
 */
export const Current = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item current="page">item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary By default Menu will show a blue border on the selected item. You can change the border color by setting `--border-background` on the `<nve-menu-item>`
 * @tags test-case
 */
export const BorderBackground = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item current="page" style="--border-background: var(--nve-ref-color-brand-green-900);">item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with disabled items showing unavailable options while maintaining visual context.
 * @tags test-case
 */
export const Disabled = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item disabled>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu items with links for navigation functionality within menu structures.
 */
export const Links = {
  render: () => html`
  <nve-menu>
    <nve-menu-item><nve-icon slot="prefix" name="person"></nve-icon><a href="#">profile</a></nve-menu-item>
    <nve-menu-item><nve-icon slot="prefix" name="gear"></nve-icon> <a href="#">settings</a></nve-menu-item>
    <nve-menu-item><nve-icon slot="prefix" name="star"></nve-icon> <a href="#">favorites</a></nve-menu-item>
    <nve-menu-item><nve-icon slot="prefix" name="logout"></nve-icon> <a href="#">logout</a></nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu item features a default slot for content, along with a suffix slot for displaying elements such as keyboard shortcuts at the end of the menu item container.
 */
export const Suffix = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>Copy<kbd  slot="suffix" nve-text="code flat">CMD + C</kbd></nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu with constrained height showing scrollable behavior when content exceeds container limits.
 * @tags test-case
 */
export const Scroll = {
  render: () => html`
  <nve-menu style="--max-height: 150px">
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item>item 2</nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
    <nve-menu-item>item 4</nve-menu-item>
    <nve-menu-item>item 5</nve-menu-item>
    <nve-menu-item>item 6</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Use a dropdown menu with search and branded logos for application selection interfaces.
 * @tags pattern
 */
export const Complex = {
  render: () => html`
  <nve-button popovertarget="dropdown-menu">dropdown</nve-button>
  <nve-dropdown id="dropdown-menu">
    <nve-search rounded>
      <input type="search" placeholder="search tools" aria-label="search apps" />
    </nve-search>
    <nve-menu>
      <nve-menu-item>
        <nve-logo color="pink-rose" size="sm">Db</nve-logo> Debugger
      </nve-menu-item>
      <nve-menu-item>
        <nve-logo color="blue-cobalt" size="sm">TM</nve-logo> Task Manager
      </nve-menu-item>
      <nve-menu-item>
        <nve-logo color="yellow-nova" size="sm">CI</nve-logo> CI Services
      </nve-menu-item>
      <nve-divider></nve-divider>
      <nve-menu-item>
        <nve-logo size="sm">NV</nve-logo> All Apps
      </nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  `
};

/**
 * @summary Use vertical navigation menu groups with optional icons to organize related destinations into collapsible sections. Use the `nve-tree` component for deeply nested navigation.
 * @tags pattern
 */
export const VerticalNavigation = {
  render: () => html`
    <div nve-layout="row gap:xl">
      <nav style="width: 175px">
        <nve-menu-group behavior-expand expanded>
          Overview
          <nve-menu>
            <nve-menu-item current="page"><nve-icon name="home" slot="prefix"></nve-icon> Getting Started</nve-menu-item>
            <nve-menu-item><nve-icon name="bell" slot="prefix"></nve-icon> Alerts</nve-menu-item>
            <nve-menu-item><nve-icon name="add" slot="prefix"></nve-icon> Create New</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
        <nve-menu-group behavior-expand expanded>
          Data
          <nve-menu>
            <nve-menu-item><nve-icon name="office-building" slot="prefix"></nve-icon> Catalog</nve-menu-item>
            <nve-menu-item><nve-icon name="view-as-grid" slot="prefix"></nve-icon> Dashboards</nve-menu-item>
            <nve-menu-item><nve-icon name="rectangle-stack-horizontal" slot="prefix"></nve-icon> Volumes</nve-menu-item>
            <nve-menu-item><nve-icon name="layers" slot="prefix"></nve-icon> Models</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
        <nve-menu-group behavior-expand expanded>
          Develop
          <nve-menu>
            <nve-menu-item><nve-icon name="code" slot="prefix"></nve-icon> Queries</nve-menu-item>
            <nve-menu-item><nve-icon name="doc-checkmark" slot="prefix"></nve-icon> Notebooks</nve-menu-item>
            <nve-menu-item><nve-icon name="branch" slot="prefix"></nve-icon> Pipelines</nve-menu-item>
            <nve-menu-item><nve-icon name="beaker" slot="prefix"></nve-icon> Experiments</nve-menu-item>
            <nve-menu-item><nve-icon name="clock" slot="prefix"></nve-icon> Runs</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
      </nav>

      <nav style="width: 175px">
        <nve-menu-group behavior-expand expanded>
          Overview
          <nve-menu>
            <nve-menu-item current="page">Getting Started</nve-menu-item>
            <nve-menu-item>Alerts</nve-menu-item>
            <nve-menu-item>Create New</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
        <nve-menu-group behavior-expand expanded>
          Data
          <nve-menu>
            <nve-menu-item>Catalog</nve-menu-item>
            <nve-menu-item>Dashboards</nve-menu-item>
            <nve-menu-item>Volumes</nve-menu-item>
            <nve-menu-item>Models</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
        <nve-menu-group behavior-expand expanded>
          Develop
          <nve-menu>
            <nve-menu-item>Queries</nve-menu-item>
            <nve-menu-item >Notebooks</nve-menu-item>
            <nve-menu-item>Pipelines</nve-menu-item>
            <nve-menu-item>Experiments</nve-menu-item>
            <nve-menu-item>Runs</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
      </nav>
    </div>
  `
};

/**
 * @summary Use a navigation drawer to overlay page content for out-of-context navigation.
 * @tags pattern
 */
export const VerticalNavigationDrawer = {
  render: () => html`
  <nve-page>
    <nve-page-header slot="header">
      <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
      <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
    </nve-page-header>
    <main nve-layout="column gap:md pad:md">
      <nve-button popovertarget="menu-drawer">toggle drawer</nve-button>
    </main>
    <nve-drawer position="right" size="sm" modal closable id="menu-drawer">
      <nve-drawer-header>
      <h3 nve-text="heading">Drawer</h3>
      </nve-drawer-header>
      <nve-drawer-content>
        <nve-menu-group behavior-expand expanded>
          Overview
          <nve-menu>
            <nve-menu-item current="page">Getting Started</nve-menu-item>
            <nve-menu-item>Alerts</nve-menu-item>
            <nve-menu-item>Create New</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
        <nve-menu-group behavior-expand expanded>
          Data
          <nve-menu>
            <nve-menu-item>Catalog</nve-menu-item>
            <nve-menu-item>Dashboards</nve-menu-item>
            <nve-menu-item>Volumes</nve-menu-item>
            <nve-menu-item>Models</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
        <nve-menu-group behavior-expand expanded>
          Develop
          <nve-menu>
            <nve-menu-item>Queries</nve-menu-item>
            <nve-menu-item >Notebooks</nve-menu-item>
            <nve-menu-item>Pipelines</nve-menu-item>
            <nve-menu-item>Experiments</nve-menu-item>
            <nve-menu-item>Runs</nve-menu-item>
          </nve-menu>
        </nve-menu-group>
      </nve-drawer-content>
    </nve-drawer>
  </nve-page>
  `
};

/**
 * @summary Use an inline navigation panel to push page content aside when navigation is contextual to the page.
 * @tags pattern
 */
export const VerticalNavigationPanel = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
  </nve-page-header>
  <nve-page-panel slot="left" size="sm" expanded>
    <nve-page-panel-header>
      <h3 nve-text="heading">Drawer</h3>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <nve-menu-group behavior-expand expanded>
        Overview
        <nve-menu>
          <nve-menu-item current="page">Getting Started</nve-menu-item>
          <nve-menu-item>Alerts</nve-menu-item>
          <nve-menu-item>Create New</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
      <nve-menu-group behavior-expand expanded>
        Data
        <nve-menu>
          <nve-menu-item>Catalog</nve-menu-item>
          <nve-menu-item>Dashboards</nve-menu-item>
          <nve-menu-item>Volumes</nve-menu-item>
          <nve-menu-item>Models</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
      <nve-menu-group behavior-expand expanded>
        Develop
        <nve-menu>
          <nve-menu-item>Queries</nve-menu-item>
          <nve-menu-item >Notebooks</nve-menu-item>
          <nve-menu-item>Pipelines</nve-menu-item>
          <nve-menu-item>Experiments</nve-menu-item>
          <nve-menu-item>Runs</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:md pad:md">
    <p nve-text="body">Content</p>
  </main>
</nve-page>
  `
};

/**
 * @summary Use a tooltip on a menu item to provide extra context and warnings.
 * @tags pattern test-case
 */
export const ItemTooltip = {
  render: () => html`
  <nve-menu>
    <nve-menu-item>item 1</nve-menu-item>
    <nve-menu-item popovertarget="menu-tooltip" id="menu-item-2">
      item 2
      <nve-icon id="menu-anchor" size="md" name="exclamation-triangle" style="margin-left: auto"></nve-icon>
      <nve-tooltip anchor="menu-anchor" id="menu-tooltip" style="interest-delay-start: 2s">This is a warning tooltip</nve-tooltip>
    </nve-menu-item>
    <nve-menu-item>item 3</nve-menu-item>
  </nve-menu>
  `
};

/**
 * @summary Menu items with danger status styling for destructive actions like delete or logout operations.
 */
export const DangerStatus = {
  render: () => html`
  <nve-menu>
    <nve-menu-item status="danger">default</nve-menu-item>
    <nve-menu-item status="danger" disabled>disabled</nve-menu-item>
    <nve-menu-item status="danger" selected>selected</nve-menu-item>
    <nve-menu-item status="danger" current="page">current</nve-menu-item>
    <nve-menu-item status="danger"><nve-icon name="gear"></nve-icon> icon left</nve-menu-item>
    <nve-menu-item status="danger">icon right <nve-icon id="warning-icon" size="md" name="exclamation-triangle" style="margin-left: auto"></nve-icon></nve-menu-item>
  </nve-menu>
  `
};
