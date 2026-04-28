// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/alert-group/define.js';
import '@nvidia-elements/core/avatar/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/chat-message/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/control-message/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/resize-handle/define.js';
import '@nvidia-elements/core/sparkline/define.js';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/tree/define.js';
import '@nvidia-elements/monaco/input/define.js';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/python.js';
import '@nvidia-elements/code/codeblock/languages/yaml.js';

/**
 * Templates are page-level starting points for Agents building new views.
 * Reach for a template first; only drop to patterns or components when no template fits.
 * Keep templates simple and minimal to allow for easy customization and extension.
 * Only one template per a high level UI domain problem should exist. Example only one dashboard template.
 */

export default {
  title: 'Patterns/Templates',
  component: 'nve-templates'
};

/**
 * @summary Page-level starter for analytics dashboards. KPI cards, sparkline trends, and an activity grid.
 * @tags template
 */
export const Dashboard = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Infrastructure</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left-aside" style="width: 220px;">
    <nve-page-panel-header>
      <h2 nve-text="heading medium">Workloads</h2>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <nve-tree>
        <nve-tree-node selected><a href="#">Training jobs</a></nve-tree-node>
        <nve-tree-node><a href="#">Checkpoints</a></nve-tree-node>
        <nve-tree-node><a href="#">Datasets</a></nve-tree-node>
        <nve-tree-node><a href="#">Clusters</a></nve-tree-node>
        <nve-tree-node><a href="#">Deployments</a></nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>
  <nve-toolbar slot="subheader" container="full">
    <div slot="prefix" nve-layout="row gap:sm align:vertical-center">
      <nve-badge status="running">Training</nve-badge>
      <span nve-text="label sm muted nowrap">Epoch 14 / 20</span>
      <nve-divider orientation="vertical"></nve-divider>
      <span nve-text="label sm muted nowrap">ETA: 4h 23m</span>
    </div>
    <nve-button-group slot="suffix">
      <nve-button>24h</nve-button>
      <nve-button pressed>7d</nve-button>
      <nve-button>30d</nve-button>
    </nve-button-group>
    <nve-divider slot="suffix" orientation="vertical"></nve-divider>
    <nve-button slot="suffix">Export</nve-button>
  </nve-toolbar>
  <main nve-layout="column gap:lg pad:lg" style="max-width: 1500px;">
    <h1 slot="prefix" nve-text="heading lg">Model 120B Fine-tune</h1>
    <section nve-layout="grid gap:lg span-items:6 align:vertical-stretch">
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">Training Loss</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center">
              <h3 nve-text="heading semibold lg">0.0234</h3>
              <nve-badge container="flat" status="success">
                <nve-icon name="trend-down" slot="prefix-icon"></nve-icon> -42%
              </nve-badge>
            </div>
            <nve-sparkline data="[0.12, 0.09, 0.075, 0.062, 0.051, 0.044, 0.039, 0.035, 0.032, 0.030, 0.028, 0.026, 0.025, 0.023]" mark="line" interpolation="smooth" status="success" size="xl"></nve-sparkline>
            <span nve-text="label sm muted">Per epoch</span>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">Validation Loss</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center">
              <h3 nve-text="heading semibold lg">0.0312</h3>
              <nve-badge container="flat" status="warning">
                <nve-icon name="trend-up" slot="prefix-icon"></nve-icon> +2%
              </nve-badge>
            </div>
            <nve-sparkline data="[0.13, 0.10, 0.082, 0.068, 0.055, 0.048, 0.042, 0.038, 0.033, 0.029, 0.030, 0.029, 0.030, 0.031]" mark="line" interpolation="smooth" status="warning" size="xl" denote-first
              denote-last denote-min></nve-sparkline>
            <span nve-text="label sm muted">Per epoch</span>
          </div>
        </nve-card-content>
      </nve-card>
    </section>
    <section nve-layout="grid gap:lg span-items:4 align:vertical-stretch">
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">Learning Rate</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <h4 nve-text="heading semibold">2.4e-5</h4>
            <nve-sparkline data="[0.5, 1.5, 3.0, 3.0, 2.8, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.8, 1.5]" mark="line" interpolation="smooth" size="lg" denote-last></nve-sparkline>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">GPU Memory</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center">
              <h4 nve-text="heading semibold">76.2 GB</h4>
              <span nve-text="label sm muted">/ 80 GB</span>
            </div>
            <nve-sparkline data="[60, 65, 70, 73, 76, 75, 76, 76, 76, 76, 76, 76, 76, 76]" mark="area" interpolation="step" status="warning" size="xl" min="0" max="80"></nve-sparkline>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">Throughput</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center">
              <h4 nve-text="heading semibold">1,842</h4>
              <span nve-text="label sm muted">tokens/s</span>
            </div>
            <nve-sparkline data="[1200, 1500, 1600, 1750, 1800, 1820, 1830, 1840, 1835, 1842, 1838, 1845, 1840, 1842]" mark="column" status="accent" size="xl" min="0"></nve-sparkline>
          </div>
        </nve-card-content>
      </nve-card>
    </section>
    <section nve-layout="column gap:sm">
      <h3 nve-text="heading sm">Checkpoint Evaluations</h3>
      <nve-grid>
        <nve-grid-header>
          <nve-grid-column>Checkpoint</nve-grid-column>
          <nve-grid-column>Epoch</nve-grid-column>
          <nve-grid-column>Train Loss</nve-grid-column>
          <nve-grid-column>Val Loss Trend</nve-grid-column>
          <nve-grid-column>Status</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>ckpt-014</nve-grid-cell>
          <nve-grid-cell>14</nve-grid-cell>
          <nve-grid-cell>0.0234</nve-grid-cell>
          <nve-grid-cell>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm">0.031</span>
              <nve-sparkline data="[0.13, 0.082, 0.055, 0.042, 0.033, 0.029, 0.031]" mark="line" interpolation="smooth" status="warning" size="md"></nve-sparkline>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge status="running" container="flat">Current</nve-badge></nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>ckpt-010</nve-grid-cell>
          <nve-grid-cell>10</nve-grid-cell>
          <nve-grid-cell>0.0298</nve-grid-cell>
          <nve-grid-cell>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm">0.029</span>
              <nve-sparkline data="[0.13, 0.082, 0.055, 0.042, 0.033, 0.029]" mark="line" interpolation="smooth" status="success" size="md"></nve-sparkline>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge status="finished" container="flat">Best</nve-badge></nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>ckpt-005</nve-grid-cell>
          <nve-grid-cell>5</nve-grid-cell>
          <nve-grid-cell>0.0512</nve-grid-cell>
          <nve-grid-cell>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm">0.048</span>
              <nve-sparkline data="[0.13, 0.082, 0.055, 0.048]" mark="line" interpolation="smooth" size="md"></nve-sparkline>
            </div>
          </nve-grid-cell>
          <nve-grid-cell><nve-badge status="finished" container="flat">Saved</nve-badge></nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    </section>
  </main>
</nve-page>
  `
};

/**
 * @summary Page-level starter for tabular list views. Search, view toggle, and a sortable data grid of records.
 * @tags template
 */
export const ListView = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Drive Library</h2>
    <nve-button selected container="flat">Drives</nve-button>
    <nve-button container="flat">Vehicles</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">AV</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left-aside" style="width: 220px;">
    <nve-page-panel-content>
      <nve-tree>
        <nve-tree-node selected><a href="#">Drive logs</a></nve-tree-node>
        <nve-tree-node><a href="#">Sensor recordings</a></nve-tree-node>
        <nve-tree-node><a href="#">Scenarios</a></nve-tree-node>
        <nve-tree-node><a href="#">Routes</a></nve-tree-node>
        <nve-tree-node><a href="#">Annotations</a></nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch" style="max-width: 1500px;">
    <nve-search container="flat">
      <input type="search" aria-label="search drives" placeholder="Search drives by route, vehicle, or scenario" />
    </nve-search>
    <div nve-layout="row align:space-between align:vertical-center">
      <nve-button-group container="rounded" behavior-select="single" orientation="horizontal">
        <nve-icon-button icon-name="view-as-grid"></nve-icon-button>
        <nve-icon-button icon-name="table" pressed></nve-icon-button>
        <nve-icon-button icon-name="map"></nve-icon-button>
      </nve-button-group>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-button container="flat" size="sm">
          <nve-icon name="filter"></nve-icon> Filter
        </nve-button>
        <nve-button interaction="emphasis" size="sm">Export</nve-button>
      </div>
    </div>
    <nve-grid>
      <nve-grid-header>
        <nve-grid-column>Drive</nve-grid-column>
        <nve-grid-column>Route</nve-grid-column>
        <nve-grid-column>Vehicle</nve-grid-column>
        <nve-grid-column>Duration</nve-grid-column>
        <nve-grid-column>Distance</nve-grid-column>
        <nve-grid-column>Status</nve-grid-column>
      </nve-grid-header>
      ${[
        { id: 'av-2841', route: 'Highway 101', vehicle: 'av-prototype-042', duration: '4h 18m', distance: '247 km', status: 'running', label: 'Recording' },
        { id: 'av-2840', route: 'Urban downtown loop', vehicle: 'av-prototype-039', duration: '2h 04m', distance: '58 km', status: 'success', label: 'Complete' },
        { id: 'av-2839', route: 'Sunnyvale residential', vehicle: 'av-prototype-042', duration: '1h 47m', distance: '42 km', status: 'success', label: 'Complete' },
        { id: 'av-2838', route: 'Foothill expressway', vehicle: 'av-prototype-041', duration: '3h 32m', distance: '189 km', status: 'warning', label: 'Flagged' },
        { id: 'av-2837', route: 'Construction reroute', vehicle: 'av-prototype-039', duration: '0h 52m', distance: '14 km', status: 'success', label: 'Complete' },
        { id: 'av-2836', route: 'Heavy rain night drive', vehicle: 'av-prototype-042', duration: '2h 15m', distance: '76 km', status: 'warning', label: 'Flagged' },
        { id: 'av-2835', route: 'Tunnel and bridge mix', vehicle: 'av-prototype-040', duration: '1h 33m', distance: '64 km', status: 'success', label: 'Complete' },
        { id: 'av-2834', route: 'Parking lot maneuvers', vehicle: 'av-prototype-039', duration: '0h 47m', distance: '6 km', status: 'success', label: 'Complete' },
        { id: 'av-2833', route: 'Mountain pass', vehicle: 'av-prototype-041', duration: '5h 06m', distance: '312 km', status: 'success', label: 'Complete' },
      ].map(d => html`
        <nve-grid-row>
          <nve-grid-cell>${d.id}</nve-grid-cell>
          <nve-grid-cell>${d.route}</nve-grid-cell>
          <nve-grid-cell>${d.vehicle}</nve-grid-cell>
          <nve-grid-cell>${d.duration}</nve-grid-cell>
          <nve-grid-cell>${d.distance}</nve-grid-cell>
          <nve-grid-cell><nve-badge status=${d.status} container="flat">${d.label}</nve-badge></nve-grid-cell>
        </nve-grid-row>
      `)}
    </nve-grid>
  </main>
</nve-page>
  `
};

/**
 * @summary Page-level starter for object detail views. Breadcrumb, summary metadata, and grouped content sections.
 * @tags template
 */
export const DetailView = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Drive Library</h2>
    <nve-button container="flat">Drives</nve-button>
    <nve-button container="flat">Vehicles</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">AV</nve-icon-button>
  </nve-page-header>

  <nve-toolbar slot="subheader" container="full">
    <nve-icon-button slot="prefix" icon-name="arrow" direction="left" size="sm" container="flat" aria-label="back"></nve-icon-button>
    <nve-breadcrumb slot="prefix">
      <nve-icon-button icon-name="home" size="sm"><a href="#" target="_self" aria-label="drive library"></a></nve-icon-button>
      <nve-button><a href="#" target="_self">Drives</a></nve-button>
      <span>Highway 101</span>
    </nve-breadcrumb>
    <nve-button slot="suffix" container="flat" size="sm">Annotate</nve-button>
    <nve-button slot="suffix" container="flat" size="sm">Download</nve-button>
    <nve-divider slot="suffix" orientation="vertical"></nve-divider>
    <nve-button slot="suffix" interaction="emphasis" size="sm">Share</nve-button>
  </nve-toolbar>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch" style="max-width: 1100px; width: 100%; margin: 0 auto;">
    <section nve-layout="row gap:md align:vertical-center align:space-between">
      <h1 nve-text="heading xl">Highway 101</h1>
      <nve-badge status="running">Recording</nve-badge>
    </section>

    <nve-card>
      <nve-card-header>
        <h2 nve-text="heading sm">Summary</h2>
      </nve-card-header>
      <nve-card-content>
        <div nve-layout="grid span-items:4 gap:md">
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Vehicle</span>
            <span nve-text="body">av-prototype-042</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Route</span>
            <span nve-text="body">San Jose to San Francisco</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Duration</span>
            <span nve-text="body">4h 18m</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Distance</span>
            <span nve-text="body">247 km</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Started</span>
            <span nve-text="body">2026-04-25 09:14 PT</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Sensors</span>
            <span nve-text="body">8 cameras, 4 LiDAR, 5 radar</span>
          </div>
        </div>
      </nve-card-content>
    </nve-card>

    <section nve-layout="grid gap:lg span-items:6 align:vertical-stretch">
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">Vehicle speed</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <h3 nve-text="heading semibold lg">68 km/h <span nve-text="label sm muted">avg</span></h3>
            <nve-sparkline data="[40, 55, 60, 72, 80, 78, 70, 65, 60, 75, 82, 70, 64, 68]" mark="area" interpolation="smooth" status="accent" size="xl"></nve-sparkline>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h2 nve-text="label muted">GPU utilization</h2>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <h3 nve-text="heading semibold lg">82% <span nve-text="label sm muted">peak</span></h3>
            <nve-sparkline data="[60, 65, 70, 76, 78, 80, 78, 80, 82, 81, 78, 75, 73, 76]" mark="line" interpolation="smooth" status="warning" size="xl"></nve-sparkline>
          </div>
        </nve-card-content>
      </nve-card>
    </section>

    <nve-card>
      <nve-card-header>
        <h2 nve-text="heading sm">Annotations</h2>
      </nve-card-header>
      <nve-card-content>
        <div nve-layout="column gap:md">
          <div nve-layout="row gap:md align:vertical-center">
            <span nve-text="label sm muted nowrap">01:14:22</span>
            <nve-badge container="flat" status="warning">Disengage</nve-badge>
            <span nve-text="body">Operator override at construction reroute on US-101 NB.</span>
          </div>
          <div nve-layout="row gap:md align:vertical-center">
            <span nve-text="label sm muted nowrap">02:46:08</span>
            <nve-badge container="flat" status="accent">Note</nve-badge>
            <span nve-text="body">Lane keep accuracy degraded under heavy rain conditions.</span>
          </div>
          <div nve-layout="row gap:md align:vertical-center">
            <span nve-text="label sm muted nowrap">03:51:44</span>
            <nve-badge container="flat" status="success">Resolved</nve-badge>
            <span nve-text="body">Perception confidence recovered after sensor self-calibration.</span>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
  </main>
</nve-page>
  `
};

/**
 * @summary Page-level starter for master-detail split views. Data grid of records with a resizable detail panel for the selected row.
 * @tags template
 */
export const SplitView = {
  render: () => html`
<nve-page id="split-view-demo">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Drive Library</h2>
    <nve-button selected container="flat">Drives</nve-button>
    <nve-button container="flat">Vehicles</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">AV</nve-icon-button>
  </nve-page-header>
  <section nve-layout="column gap:md pad:md full">
    <nve-search container="flat">
      <input type="search" aria-label="search drives" placeholder="Search drives by route, vehicle, or scenario" />
    </nve-search>
    <nve-grid>
      <nve-grid-header>
        <nve-grid-column>Drive</nve-grid-column>
        <nve-grid-column>Route</nve-grid-column>
        <nve-grid-column>Vehicle</nve-grid-column>
        <nve-grid-column>Duration</nve-grid-column>
        <nve-grid-column>Distance</nve-grid-column>
        <nve-grid-column>Status</nve-grid-column>
        <nve-grid-column width="max-content" aria-label="details"></nve-grid-column>
      </nve-grid-header>
      ${[
        { id: 'av-2841', route: 'Highway 101', vehicle: 'av-prototype-042', duration: '4h 18m', distance: '247 km', status: 'running', label: 'Recording' },
        { id: 'av-2840', route: 'Urban downtown loop', vehicle: 'av-prototype-039', duration: '2h 04m', distance: '58 km', status: 'success', label: 'Complete' },
        { id: 'av-2839', route: 'Sunnyvale residential', vehicle: 'av-prototype-042', duration: '1h 47m', distance: '42 km', status: 'success', label: 'Complete' },
        { id: 'av-2838', route: 'Foothill expressway', vehicle: 'av-prototype-041', duration: '3h 32m', distance: '189 km', status: 'warning', label: 'Flagged' },
        { id: 'av-2837', route: 'Construction reroute', vehicle: 'av-prototype-039', duration: '0h 52m', distance: '14 km', status: 'success', label: 'Complete' },
        { id: 'av-2836', route: 'Heavy rain night drive', vehicle: 'av-prototype-042', duration: '2h 15m', distance: '76 km', status: 'warning', label: 'Flagged' },
        { id: 'av-2835', route: 'Tunnel and bridge mix', vehicle: 'av-prototype-040', duration: '1h 33m', distance: '64 km', status: 'success', label: 'Complete' },
        { id: 'av-2834', route: 'Parking lot maneuvers', vehicle: 'av-prototype-039', duration: '0h 47m', distance: '6 km', status: 'success', label: 'Complete' },
        { id: 'av-2833', route: 'Mountain pass', vehicle: 'av-prototype-041', duration: '5h 06m', distance: '312 km', status: 'success', label: 'Complete' },
      ].map((d, i) => html`
        <nve-grid-row ?selected=${i === 0}>
          <nve-grid-cell>${d.id}</nve-grid-cell>
          <nve-grid-cell>${d.route}</nve-grid-cell>
          <nve-grid-cell>${d.vehicle}</nve-grid-cell>
          <nve-grid-cell>${d.duration}</nve-grid-cell>
          <nve-grid-cell>${d.distance}</nve-grid-cell>
          <nve-grid-cell><nve-badge container="flat" status=${d.status}>${d.label}</nve-badge></nve-grid-cell>
          <nve-grid-cell>
            <nve-icon-button container="flat" icon-name="expand-details" value=${d.id} aria-label="view ${d.id}"></nve-icon-button>
          </nve-grid-cell>
        </nve-grid-row>
      `)}
    </nve-grid>
  </section>
  <nve-resize-handle slot="right" dir="rtl" orientation="vertical" min="320" max="640" value="420" step="20"></nve-resize-handle>
  <nve-page-panel slot="right" expanded closable style="width: 520px;">
    <nve-page-panel-header>
      <div nve-layout="row align:space-between align:vertical-center full">
        <div nve-layout="row gap:sm align:vertical-center">
          <h3 nve-text="heading sm">Highway 101</h3>
          <nve-badge container="flat" status="running">Recording</nve-badge>
        </div>
      </div>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <div nve-layout="column gap:xl">
        <div nve-layout="grid span-items:6 gap:md">
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Drive</span>
            <span nve-text="body">av-2841</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Vehicle</span>
            <span nve-text="body">av-prototype-042</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Route</span>
            <span nve-text="body">San Jose to SF</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Duration</span>
            <span nve-text="body">4h 18m</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Distance</span>
            <span nve-text="body">247 km</span>
          </div>
          <div nve-layout="column gap:xs">
            <span nve-text="label sm muted">Started</span>
            <span nve-text="body">2026-04-25 09:14 PT</span>
          </div>
        </div>
        <div nve-layout="grid span-items:6 gap:md">
          <div nve-layout="column gap:sm">
            <span nve-text="label muted">Vehicle speed</span>
            <span nve-text="body">68 km/h <span nve-text="label sm muted">avg</span></span>
            <nve-sparkline data="[40, 55, 60, 72, 80, 78, 70, 65, 60, 75, 82, 70, 64, 68]" mark="area" interpolation="smooth" status="accent" size="xl"></nve-sparkline>
          </div>
          <div nve-layout="column gap:sm">
            <span nve-text="label muted">GPU utilization</span>
            <span nve-text="body">82% <span nve-text="label sm muted">peak</span></span>
            <nve-sparkline data="[60, 65, 70, 76, 78, 80, 78, 80, 82, 81, 78, 75, 73, 76]" mark="line" interpolation="smooth" status="warning" size="xl"></nve-sparkline>
          </div>
        </div>
      </div>
    </nve-page-panel-content>
    <nve-page-panel-footer>
      <div nve-layout="row gap:sm align:right full">
        <nve-button container="flat" size="sm">Annotate</nve-button>
        <nve-button container="flat" size="sm">Download</nve-button>
        <nve-button interaction="emphasis" size="sm">Share</nve-button>
      </div>
    </nve-page-panel-footer>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Page-level starter for browseable collections like asset catalogs, or media galleries.
 * @tags pattern test-case
 */
export const MediaListView = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Drive Library</h2>
    <nve-button selected container="flat">Drives</nve-button>
    <nve-button container="flat">Vehicles</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">AV</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left-aside" style="width: 220px;">
    <nve-page-panel-content>
      <nve-tree>
        <nve-tree-node selected><a href="#">Drive logs</a></nve-tree-node>
        <nve-tree-node><a href="#">Sensor recordings</a></nve-tree-node>
        <nve-tree-node><a href="#">Scenarios</a></nve-tree-node>
        <nve-tree-node><a href="#">Routes</a></nve-tree-node>
        <nve-tree-node><a href="#">Annotations</a></nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch" style="max-width: 1500px;">
    <nve-search container="flat">
      <input type="search" aria-label="search drives" placeholder="Search drives by route, vehicle, or scenario" />
    </nve-search>
    <nve-button-group container="rounded" behavior-select="single" orientation="horizontal">
      <nve-icon-button icon-name="view-as-grid" pressed></nve-icon-button>
      <nve-icon-button icon-name="table"></nve-icon-button>
      <nve-icon-button icon-name="map"></nve-icon-button>
    </nve-button-group>
    <section nve-layout="grid span-items:3 gap:md">
      ${[
        { id: 'av-2840', route: 'Urban downtown loop', vehicle: 'av-prototype-039', duration: '2h 04m', distance: '58 km' },
        { id: 'av-2839', route: 'Sunnyvale residential', vehicle: 'av-prototype-042', duration: '1h 47m', distance: '42 km' },
        { id: 'av-2838', route: 'Foothill expressway', vehicle: 'av-prototype-041', duration: '3h 32m', distance: '189 km' },
        { id: 'av-2837', route: 'Construction reroute', vehicle: 'av-prototype-039', duration: '0h 52m', distance: '14 km' },
        { id: 'av-2836', route: 'Heavy rain night drive', vehicle: 'av-prototype-042', duration: '2h 15m', distance: '76 km' },
        { id: 'av-2835', route: 'Tunnel and bridge mix', vehicle: 'av-prototype-040', duration: '1h 33m', distance: '64 km' },
        { id: 'av-2834', route: 'Parking lot maneuvers', vehicle: 'av-prototype-039', duration: '0h 47m', distance: '6 km' },
        { id: 'av-2833', route: 'Mountain pass', vehicle: 'av-prototype-041', duration: '5h 06m', distance: '312 km' },
      ].map(d => html`
      <nve-card style="height: 100%; width: 100%;">
        <img src="static/images/test-image-1.svg" alt="route preview for ${d.route}" loading="lazy" style="width: 100%; object-fit: cover; max-height: 200px;" />
        <nve-card-header>
          <h3 nve-text="heading sm">${d.route}</h3>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:sm">
            <span nve-text="body sm muted">${d.vehicle}</span>
            <span nve-text="body sm muted">${d.duration} • ${d.distance}</span>
          </div>
        </nve-card-content>
        <nve-card-footer>
          <div nve-layout="grid span-items:6 gap:xs">
            <nve-button>Export</nve-button>
            <nve-button>View</nve-button>
          </div>
        </nve-card-footer>
      </nve-card>
      `)}
    </section>
  </main>
</nve-page>
  `
};

/**
 * @summary Page-level starter for object detail views with media playback. Player canvas with metadata panel and playback controls.
 * @tags template
 */
export const MediaDetailView = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Event Recorder</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="column gap:md align:stretch">
        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
            <h2 nve-text="heading sm">event-recording.mp4</h2>
          </section>
          <nve-icon-button aria-label="additional options" icon-name="more-actions" container="flat"></nve-icon-button>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="right" size="sm">
    <nve-page-panel-content>
      <div nve-layout="column gap:md">
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">Recorded</span>
          <time datetime="2026-01-08 14:23:56" nve-text="body sm">2026-01-08 14:23:56</time>
        </div>
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">Intervention</span>
          <span nve-text="body sm">00:37:12</span>
        </div>
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">Trigger Reason</span>
          <span nve-text="body sm">Zone not detected</span>
        </div>
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">Duration</span>
          <span nve-text="body sm">12.3 seconds</span>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
  <video style="width: 100%; height: 100%; background: var(--nve-ref-color-alpha-black-700)"></video>
  <nve-page-panel slot="bottom" style="max-height: 100px">
    <nve-page-panel-content>
      <div nve-layout="column gap:sm full">
        <div role="group" aria-label="time scrubber controls" nve-layout="row gap:sm align:vertical-center full">
          <time datetime="00:14:23" nve-text="body sm muted">00:14:23</time>
          <nve-range>
            <input type="range" min="0" max="6300" value="890" aria-label="playback time" />
          </nve-range>
          <time datetime="01:45:00" nve-text="body sm muted">01:45:00</time>
        </div>
        <nve-toolbar aria-label="video control options" container="inset">
          <nve-button-group container="flat" aria-label="playback controls">
            <nve-icon-button aria-label="go to start" icon-name="start" size="sm"></nve-icon-button>
            <nve-icon-button aria-label="rewind" icon-name="rewind" size="sm"></nve-icon-button>
            <nve-icon-button aria-label="play" icon-name="play" size="sm"></nve-icon-button>
            <nve-icon-button aria-label="fast forward" icon-name="fast-forward" size="sm"></nve-icon-button>
            <nve-icon-button aria-label="go to end" icon-name="start" direction="down" size="sm"></nve-icon-button>
          </nve-button-group>
          <div aria-label="volume controls" role="group" slot="suffix" nve-layout="row gap:xs align:vertical-center">
            <nve-icon-button aria-label="mute volume" icon-name="volume" size="sm" container="flat"></nve-icon-button>
            <nve-range style="width: 100px;">
              <input type="range" min="0" max="100" value="50" aria-label="volume" />
            </nve-range>
          </div>
          <nve-select slot="suffix" container="flat" style="--width: 70px;">
            <select aria-label="playback speed">
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </nve-select>
          <nve-icon-button aria-label="fullscreen" slot="suffix" icon-name="maximize" size="sm" container="flat"></nve-icon-button>
        </nve-toolbar>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
  <nve-toolbar slot="subfooter">
    <span nve-text="body sm muted">Device: AV-042</span>
    <nve-divider orientation="vertical"></nve-divider>
    <span nve-text="body sm muted">Route: Santa Clara</span>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Page-level starter for sign-in pages. Centered card with email, password, OAuth options, and signup link.
 * @tags template
 */
export const Auth = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading sm">Developer Portal</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:center align:vertical-center">
    <form>
      <nve-card style="width: 400px">
        <nve-card-header>
          <h1 nve-text="heading medium">Sign In</h1>
        </nve-card-header>
        <nve-card-content>
          <div nve-layout="column gap:md align:horizontal-stretch">
            <nve-input>
              <label>Email address</label>
              <input type="email" name="email" required autocomplete="email" />
              <nve-control-message error="valueMissing">required</nve-control-message>
              <nve-control-message error="typeMismatch">enter a valid email</nve-control-message>
            </nve-input>
            <nve-password>
              <label>Password</label>
              <input type="password" name="password" required minlength="6" autocomplete="current-password" />
              <nve-control-message error="valueMissing">required</nve-control-message>
              <nve-control-message error="tooShort">minimum length is 6 characters</nve-control-message>
            </nve-password>
            <div nve-layout="row align:space-between align:vertical-center full">
              <nve-checkbox>
                <label>Remember me</label>
                <input type="checkbox" name="remember-me" />
              </nve-checkbox>
              <a href="#" nve-text="body sm">Forgot password?</a>
            </div>
            <nve-button type="submit" interaction="emphasis" disabled style="width: 100%">Sign in</nve-button>
            <div nve-layout="row gap:sm align:vertical-center pad-y:md">
              <nve-divider style="flex: 1"></nve-divider>
              <span nve-text="label sm muted">Or continue with</span>
              <nve-divider style="flex: 1"></nve-divider>
            </div>
            <nve-button type="button">SSO Provider</nve-button>
            <nve-alert-group hidden status="success">
              <nve-alert></nve-alert>
            </nve-alert-group>
          </div>
        </nve-card-content>
        <nve-card-footer>
          <p nve-text="body sm muted center" style="width: 100%">
            Not a member? <a href="#" nve-text="body sm">Sign Up</a>
          </p>
        </nve-card-footer>
      </nve-card>
    </form>
  </main>
</nve-page>
<script type="module">
  const form = document.querySelector('form');
  const button = form.querySelector('nve-button[type="submit"]');
  const alertGroup = form.querySelector('nve-alert-group');
  const alert = form.querySelector('nve-alert');

  form.addEventListener('input', () => {
    button.disabled = form.matches(':invalid');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { email } = Object.fromEntries(new FormData(form));
    alert.innerText = 'Signed in as ' + email;
    alertGroup.hidden = false;
  });
</script>
  `
};

/**
 * @summary Page-level starter for IDE-style editors. File tree, tabbed code editor, and console panel.
 * @tags template
 */
export const CodeEditor = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Config Editor</h2>
    <nve-button container="flat" selected>Sensors</nve-button>
    <nve-button container="flat">Vehicle</nve-button>
    <nve-button container="flat">Perception</nve-button>
    <nve-icon-button slot="suffix" interaction="emphasis" size="sm">AV</nve-icon-button>
  </nve-page-header>
  <nve-toolbar slot="left-aside" orientation="vertical">
    <nve-button-group>
      <nve-icon-button icon-name="folder" size="sm" selected></nve-icon-button>
      <nve-icon-button icon-name="search" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="branch" size="sm"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>
  <nve-page-panel slot="left" size="sm">
    <nve-page-panel-content>
      <nve-tree behavior-expand>
        <nve-tree-node expanded>
          av-prototype/
          <nve-tree-node expanded>
            sensors/
            <nve-tree-node>lidar_config.py</nve-tree-node>
            <nve-tree-node>camera_config.py</nve-tree-node>
            <nve-tree-node>radar_config.py</nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            perception/
            <nve-tree-node>detection.py</nve-tree-node>
            <nve-tree-node>tracking.py</nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            planning/
            <nve-tree-node>route_planner.py</nve-tree-node>
          </nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column full">
    <nve-toolbar container="full">
      <nve-tabs behavior-select>
        <nve-tabs-item selected>lidar_config.py</nve-tabs-item>
      </nve-tabs>
    </nve-toolbar>
    <nve-monaco-input
      language="python"
      line-numbers="on"
      folding
      style="flex: 1; --min-height: 100%; --border-radius: 0;"
      value="from dataclasses import dataclass
from typing import Literal

@dataclass
class LidarConfig:
    &quot;&quot;&quot;Front LIDAR sensor configuration for AV prototype.&quot;&quot;&quot;
    
    model: str = 'Velodyne-128'
    range_max: float = 120.0  # meters
    range_min: float = 0.5
    fov_horizontal: float = 360.0  # degrees
    fov_vertical: float = 40.0
    points_per_second: int = 300000
    rotation_rate: int = 20  # Hz
    
    # Mounting position relative to vehicle center
    position_x: float = 2.1  # meters forward
    position_y: float = 0.0  # centered
    position_z: float = 1.8  # height from ground
    
    # Calibration parameters
    roll_offset: float = 0.0
    pitch_offset: float = -0.5  # slight downward tilt
    yaw_offset: float = 0.0
"></nve-monaco-input>
  </main>
  <nve-page-panel slot="bottom" size="sm" closable>
    <nve-page-panel-header>
      <nve-tabs behavior-select>
        <nve-tabs-item selected>Problems</nve-tabs-item>
        <nve-tabs-item>Output</nve-tabs-item>
        <nve-tabs-item>Terminal</nve-tabs-item>
      </nve-tabs>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <p nve-text="body sm muted">No problems detected in workspace</p>
    </nve-page-panel-content>
  </nve-page-panel>
  <nve-toolbar slot="subfooter">
    <nve-icon-button icon-name="branch" size="sm" container="flat"></nve-icon-button>
    <span nve-text="body sm muted">main</span>
    <nve-divider orientation="vertical"></nve-divider>
    <span nve-text="body sm muted">Ln 1, Col 1</span>
    <span slot="suffix" nve-text="body sm muted">Python</span>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Page-level starter for chat experiences. Conversation list, message thread, and prompt composer.
 * @tags template
 */
export const Chat = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Assistant</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
    <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-page-panel slot="left-aside" style="width: 220px;">
    <nve-page-panel-header>Conversations</nve-page-panel-header>
    <nve-page-panel-content>
      <nve-tree>
        <nve-tree-node selected><a href="#">Deployment review</a></nve-tree-node>
        <nve-tree-node><a href="#">Schema migration</a></nve-tree-node>
        <nve-tree-node><a href="#">Sensor calibration</a></nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:lg pad:lg" style="max-width: 760px; margin: 0 auto; width: 100%;">
    <nve-chat-message>
      <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
      Hello, how can I help you with your deployment review today?
    </nve-chat-message>
    <nve-chat-message style="margin-left: auto">
      Summarize the failing checks on PR 2381.
      <nve-avatar slot="suffix" color="green-grass">EL</nve-avatar>
    </nve-chat-message>
    <nve-chat-message>
      <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
      Two checks failed on PR 2381: the visual regression suite reported diffs in the dashboard pattern, and the lighthouse budget regressed by 4 points on the editor pattern.
    </nve-chat-message>
  </main>
  <form slot="subfooter" nve-layout="row gap:sm pad:md" style="max-width: 760px; margin: 0 auto; width: 100%;">
    <nve-textarea>
      <textarea placeholder="Ask a follow-up..." autocomplete="off" aria-label="message"></textarea>
    </nve-textarea>
    <nve-button>Send</nve-button>
  </form>
</nve-page>
  `
};

/**
 * @summary Page-level starter for multi-step wizards. Stepper, form sections, and footer navigation.
 * @tags template
 */
export const Wizard = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <main nve-layout="grid gap:lg pad:lg align:horizontal-stretch" style="max-width: 1024px; min-height: 980px; margin: auto">
    <div nve-layout="span:1">
      <nve-steps vertical>
        <nve-steps-item selected>Robot Profile</nve-steps-item>
        <nve-steps-item>Perception Sensors</nve-steps-item>
        <nve-steps-item>Navigation Stack</nve-steps-item>
        <nve-steps-item>Safety Limits</nve-steps-item>
        <nve-steps-item>Deploy Runtime</nve-steps-item>
      </nve-steps>
    </div>
    <section nve-layout="span:9 column gap:lg">
      <h1 nve-text="heading lg">Deployment Setup</h1>
      <nve-card style="min-height: 300px; width: 100%;"></nve-card>
      <nve-card style="min-height: 300px; width: 100%;"></nve-card>
    </section>
  </main>
  <nve-page-panel slot="footer">
    <nve-page-panel-content>
      <div nve-layout="row align:space-between gap:md" style="max-width:860px;margin:auto">
        <nve-button id="btn-back" container="flat" disabled size="sm">Previous</nve-button>
        <div nve-layout="row gap:sm align:vertical-center">
          <span id="step-indicator" nve-text="body sm muted">Stage 1 of 5</span>
          <nve-button id="btn-next" interaction="emphasis" size="sm">Continue</nve-button>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Page-level starter for developer docs. Search header, hierarchical nav tree, and an article with prose and code samples.
 * @tags template
 */
export const Docs = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading sm">Robotics SDK</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Tutorials</a></nve-button>
    <nve-button container="flat"><a href="#">API</a></nve-button>
    <nve-icon-button slot="suffix" container="flat" icon-name="search" aria-label="search"></nve-icon-button>
    <nve-icon-button slot="suffix" interaction="emphasis" size="sm">RB</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="left-aside" style="width: 240px;">
    <nve-page-panel-content>
      <nve-tree behavior-expand>
        <nve-tree-node expanded>
          Getting started
          <nve-tree-node><a href="#">Installation</a></nve-tree-node>
          <nve-tree-node><a href="#">Hello robot</a></nve-tree-node>
          <nve-tree-node><a href="#">Simulation setup</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node expanded>
          Perception
          <nve-tree-node><a href="#">Camera streams</a></nve-tree-node>
          <nve-tree-node><a href="#">LiDAR fusion</a></nve-tree-node>
          <nve-tree-node selected><a href="#">Object detection</a></nve-tree-node>
          <nve-tree-node><a href="#">Tracking</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Manipulation
          <nve-tree-node><a href="#">Grasp policy</a></nve-tree-node>
          <nve-tree-node><a href="#">Trajectory planner</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Deployment
          <nve-tree-node><a href="#">TensorRT runtime</a></nve-tree-node>
          <nve-tree-node><a href="#">Edge inference</a></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column gap:xl pad:lg align:horizontal-stretch" style="max-width: 760px; width: 100%; margin: 0 auto;">
    <h1 nve-text="display sm">Object Detection</h1>
    <p nve-text="body lg muted">
      Real-time perception pipeline for detecting and classifying objects from camera streams on robots and edge devices.
    </p>
    <h2 nve-text="heading lg">Installation</h2>
    <p nve-text="body">
      The pipeline ships as part of the <code nve-text="code">perception</code> package. Install it alongside the runtime to get the GPU-accelerated kernels and the pretrained model registry.
    </p>
    <nve-codeblock>
pip install perception==2.4.0
    </nve-codeblock>

    <h2 nve-text="heading lg">Usage</h2>
    <p nve-text="body">
      Instantiate a <code nve-text="code">DetectionPipeline</code> with a pretrained model and a camera source, then iterate over
      detections in your control loop. The pipeline manages preprocessing, batched inference, and non-maximum
      suppression so your control code stays focused on policy decisions.
    </p>
    <nve-codeblock>
from isaac.perception import DetectionPipeline, CameraSource

pipeline = DetectionPipeline(
    model="yolov8-nano",
    confidence=0.6,
    device="cuda:0",
)
camera = CameraSource(topic="/front_cam/image_raw")

for frame in camera.stream():
    detections = pipeline.run(frame)
    for det in detections:
        print(det.label, det.bbox, det.score)
    </nve-codeblock>

    <nve-alert status="warning">
      Inference latency above 30 ms can break real-time control loops on mobile robots; profile end-to-end before deploying.
    </nve-alert>
    <h2 nve-text="heading lg">API reference</h2>
    <p nve-text="body">
      See the API tab for the full <code nve-text="code">DetectionPipeline</code> class signature, supported models, and event hooks.
      Related primitives: <a href="#">CameraSource</a>, <a href="#">Tracker</a>, <a href="#">DepthEstimator</a>.
    </p>
  </main>
</nve-page>
  `
};
