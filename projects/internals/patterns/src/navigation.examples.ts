// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/tree/define.js';

export default {
  title: 'Patterns/Navigation',
  component: 'nve-patterns'
};

/**
 * @summary Tree integrated in vertical navigation. Use for providing structured sidebar navigation for application layouts and content organization.
 * @tags pattern
 */
export const ComplexTreeNavigation = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>
      <nve-tree behavior-expand selectable="single" behavior-select>
        <nve-tree-node expanded>
          <a href=".">Overview</a>
          <nve-tree-node><a href=".">Dashboard</a></nve-tree-node>
          <nve-tree-node><a href=".">Alerts</a></nve-tree-node>
          <nve-tree-node><a href=".">Activity Feed</a></nve-tree-node>
        </nve-tree-node>

        <nve-tree-node expanded>
          <a href=".">Compute</a>
          <nve-tree-node><a href=".">Clusters</a></nve-tree-node>
          <nve-tree-node><a href=".">Instances</a></nve-tree-node>
          <nve-tree-node><a href=".">Schedulers</a></nve-tree-node>
          <nve-tree-node expanded>
            <a href=".">Provisioning</a>
            <nve-tree-node><a href=".">Templates</a></nve-tree-node>
            <nve-tree-node><a href=".">Reservations</a></nve-tree-node>
          </nve-tree-node>
        </nve-tree-node>

        <nve-tree-node expanded>
          <a href=".">Storage</a>
          <nve-tree-node><a href=".">Volumes</a></nve-tree-node>
          <nve-tree-node><a href=".">Backups</a></nve-tree-node>
          <nve-tree-node><a href=".">Snapshots</a></nve-tree-node>
          <nve-tree-node><a href=".">Retention Policies</a></nve-tree-node>
        </nve-tree-node>

        <nve-tree-node expanded>
          <a href=".">Networking</a>
          <nve-tree-node><a href=".">Load Balancers</a></nve-tree-node>
          <nve-tree-node><a href=".">DNS Zones</a></nve-tree-node>
          <nve-tree-node><a href=".">Gateways</a></nve-tree-node>
          <nve-tree-node expanded>
            <a href=".">Security</a>
            <nve-tree-node><a href=".">Firewalls</a></nve-tree-node>
            <nve-tree-node><a href=".">Policies</a></nve-tree-node>
            <nve-tree-node><a href=".">Certificates</a></nve-tree-node>
          </nve-tree-node>
        </nve-tree-node>

        <nve-tree-node>
          <a href=".">Operations</a>
          <nve-tree-node><a href=".">Runbooks</a></nve-tree-node>
          <nve-tree-node><a href=".">Maintenance</a></nve-tree-node>
          <nve-tree-node><a href=".">Incident Queue</a></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">Infrastructure</h1>
    <p nve-text="body">
      Select a placeholder link in the sidebar tree to model deep, category-based navigation.
    </p>
  </main>
</nve-page>`
}

/**
 * @summary Drawer based navigation. Use for secondary or mobile navigation when available space gets tight.
 * @tags pattern
 */
export const DrawerNavigation = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-icon-button
      popovertarget="drawer"
      slot="suffix"
      container="flat"
      icon-name="menu"
      aria-label="menu"
    ></nve-icon-button>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <h1 nve-text="heading">main</h1>
    <p nve-text="body">page content</p>
  </main>
  <nve-drawer id="drawer" position="left" size="sm" closable>
    <nve-drawer-header>
      <h3 nve-text="heading medium sm">Navigation</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <nve-tree behavior-expand>
        <nve-tree-node><a href="#">Documentation</a></nve-tree-node>
        <nve-tree-node><a href="#">Support</a></nve-tree-node>
        <nve-tree-node expanded>
          Elements
          <nve-tree-node><a href="#">Alert</a></nve-tree-node>
          <nve-tree-node><a href="#">Badge</a></nve-tree-node>
          <nve-tree-node><a href="#">Dialog</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Frameworks
          <nve-tree-node><a href="#">Angular</a></nve-tree-node>
          <nve-tree-node><a href="#">React</a></nve-tree-node>
          <nve-tree-node><a href="#">Vue</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Languages
          <nve-tree-node><a href="#">JavaScript</a></nve-tree-node>
          <nve-tree-node><a href="#">HTML</a></nve-tree-node>
          <nve-tree-node><a href="#">CSS</a></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-drawer-content>
  </nve-drawer>
</nve-page>
  `
};
