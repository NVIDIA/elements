// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Patterns/Dashboard',
  component: 'nve-patterns'
};

/**
 * @summary Dashboard masonry layout for monitoring workflows with KPI cards, sparkline trends, and a checkpoint evaluation grid. Use for real-time operational views where users need to scan progress and spot anomalies at a glance.
 * @tags pattern
 */
export const TrainingMonitor = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Infrastructure</h2>
    <nve-button selected container="flat"><a href="#">Documentation</a></nve-button>
    <nve-button container="flat"><a href="#">Support</a></nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>
  <nve-toolbar slot="subheader" container="full">\
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
  <main nve-layout="column gap:lg pad:lg" style="max-width: 1300px;">
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
 * @summary Project board with workflow stage columns for tracking items through a workflow / process pipeline. Use for project management views where teams need to visualize work-in-progress across sequential stages like build, test, and merge workflows.
 * @tags pattern
 */
export const ProjectBoard = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
        <nve-icon-button slot="suffix" container="flat" icon-name="switch-apps"></nve-icon-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>
      <main nve-layout="column gap:lg pad:lg">
        <div nve-layout="row align:space-between align:vertical-center">
          <h1 nve-text="heading lg">Project Board</h1>
        </div>
        <nve-search container="flat">
          <input type="search" placeholder="Search tasks by model, sensor, pipeline, etc" aria-label="search tasks" />
        </nve-search>
        <div nve-layout="row align:space-between align:vertical-center">
          <div nve-layout="row gap:sm align:vertical-center">
            <nve-button-group behavior-select="single">
              <nve-button pressed size="sm">Board</nve-button>
              <nve-button size="sm">List</nve-button>
            </nve-button-group>
            <nve-button container="flat" size="sm"><nve-icon name="gear"></nve-icon> Display Settings</nve-button>
          </div>
          <nve-sort-button></nve-sort-button>
        </div>
        <div nve-layout="grid span-items:4 gap:lg align:vertical-stretch">
          <section nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center align:space-between">
              <h3 nve-text="heading sm">Backlog</h3>
              <nve-dot>2</nve-dot>
            </div>
            <nve-card>
              <nve-card-header>
                <div nve-layout="row align:space-between align:vertical-center">
                  <h4 nve-text="heading xs">LiDAR Calibration</h4>
                  <nve-badge status="danger">High</nve-badge>
                </div>
              </nve-card-header>
              <nve-card-content>
                <p nve-text="body sm muted">Recalibrate 3D LiDAR sensor array after firmware update on the warehouse fleet.</p>
              </nve-card-content>
              <nve-card-footer>
                <div nve-layout="row full align:space-between align:vertical-center">
                  <nve-avatar-group>
                    <nve-avatar size="xs" color="green-grass">MK</nve-avatar>
                    <nve-avatar size="xs" color="purple-violet">JL</nve-avatar>
                    <nve-avatar size="xs" color="green-mint">+3</nve-avatar>
                  </nve-avatar-group>
                  <nve-button container="flat" size="sm">View Issue</nve-button>
                </div>
              </nve-card-footer>
            </nve-card>
            <nve-card>
              <nve-card-header>
                <div nve-layout="row align:space-between align:vertical-center">
                  <h4 nve-text="heading xs">Sim-to-Real Transfer</h4>
                  <nve-badge status="warning">Medium</nve-badge>
                </div>
              </nve-card-header>
              <nve-card-content>
                <p nve-text="body sm muted">Validate domain randomization parameters for Isaac Sim grasping policy transfer.</p>
              </nve-card-content>
              <nve-card-footer>
                <div nve-layout="row full align:space-between align:vertical-center">
                  <nve-avatar-group>
                    <nve-avatar size="xs" color="green-grass">RN</nve-avatar>
                    <nve-avatar size="xs" color="purple-violet">TS</nve-avatar>
                    <nve-avatar size="xs" color="green-mint">+1</nve-avatar>
                  </nve-avatar-group>
                  <nve-button container="flat" size="sm">View Issue</nve-button>
                </div>
              </nve-card-footer>
            </nve-card>
          </section>
          <section nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center align:space-between">
              <h3 nve-text="heading sm">In Progress</h3>
              <nve-dot>2</nve-dot>
            </div>
            <nve-card>
              <nve-card-header>
                <div nve-layout="row align:space-between align:vertical-center">
                  <h4 nve-text="heading xs">Perception Pipeline v2</h4>
                  <nve-badge status="danger">High</nve-badge>
                </div>
              </nve-card-header>
              <nve-card-content>
                <p nve-text="body sm muted">Migrate object detection from YOLOv8 to a transformer-based model for improved occlusion handling.</p>
              </nve-card-content>
              <nve-card-footer>
                <div nve-layout="row full align:space-between align:vertical-center">
                  <nve-avatar-group>
                    <nve-avatar size="xs" color="green-grass">AP</nve-avatar>
                    <nve-avatar size="xs" color="purple-violet">SG</nve-avatar>
                    <nve-avatar size="xs" color="green-mint">+4</nve-avatar>
                  </nve-avatar-group>
                  <nve-button container="flat" size="sm">View Issue</nve-button>
                </div>
              </nve-card-footer>
            </nve-card>
            <nve-card>
              <nve-card-header>
                <div nve-layout="row align:space-between align:vertical-center">
                  <h4 nve-text="heading xs">Arm Trajectory Planner</h4>
                  <nve-badge status="warning">Medium</nve-badge>
                </div>
              </nve-card-header>
              <nve-card-content>
                <p nve-text="body sm muted">Optimize inverse kinematics solver for 7-DOF manipulator to reduce planning latency below 50 ms.</p>
              </nve-card-content>
              <nve-card-footer>
                <div nve-layout="row full align:space-between align:vertical-center">
                  <nve-avatar-group>
                    <nve-avatar size="xs" color="green-grass">KW</nve-avatar>
                    <nve-avatar size="xs" color="purple-violet">DM</nve-avatar>
                    <nve-avatar size="xs" color="green-mint">+2</nve-avatar>
                  </nve-avatar-group>
                  <nve-button container="flat" size="sm">View Issue</nve-button>
                </div>
              </nve-card-footer>
            </nve-card>
          </section>
          <section nve-layout="column gap:sm">
            <div nve-layout="row gap:sm align:vertical-center align:space-between">
              <h3 nve-text="heading sm">Merged</h3>
              <nve-dot>1</nve-dot>
            </div>
            <nve-card>
              <nve-card-header>
                <div nve-layout="row align:space-between align:vertical-center">
                  <h4 nve-text="heading xs">Map Persistence</h4>
                  <nve-badge status="success">Low</nve-badge>
                </div>
              </nve-card-header>
              <nve-card-content>
                <p nve-text="body sm muted">Add map serialization so autonomous mobile robots resume navigation after power cycles.</p>
              </nve-card-content>
              <nve-card-footer>
                <div nve-layout="row full align:space-between align:vertical-center">
                  <nve-avatar-group>
                    <nve-avatar size="xs" color="green-grass">LZ</nve-avatar>
                    <nve-avatar size="xs" color="purple-violet">MK</nve-avatar>
                    <nve-avatar size="xs" color="green-mint">+1</nve-avatar>
                  </nve-avatar-group>
                  <nve-button container="flat" size="sm">View Issue</nve-button>
                </div>
              </nve-card-footer>
            </nve-card>
          </section>
        </div>
      </main>
    </nve-page>
  `
};

/**
 * @summary Multi-route dashboard with top-level navigation and URL-synchronized tab views. Use for resource management pages where nested routes preserve context and browser history while keeping overview, activity, and access tasks close together.
 * @tags pattern
 */
export const AdminRoutes = {
  render() {
    return html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">OP</nve-logo>
    <h2 slot="prefix" nve-text="heading">Operations Admin</h2>
    <nve-button selected container="flat"><a href="/admin/dashboard">Dashboard</a></nve-button>
    <nve-button container="flat"><a href="/admin/teams">Teams</a></nve-button>
    <nve-button container="flat"><a href="/admin/billing">Billing</a></nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">MK</nve-icon-button>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg" style="max-width: 1300px;">
    <div nve-layout="column gap:sm">
      <p nve-text="label sm muted">Dashboard / Services / Inference API</p>
      <h1 nve-text="heading lg">Inference API</h1>
    </div>
    <nve-tabs-group id="admin-route-tabs">
      <nve-tabs>
        <nve-tabs-item
          selected
          command="--toggle"
          commandfor="admin-route-tabs"
          value="overview"
        >Overview</nve-tabs-item>
        <nve-tabs-item
          command="--toggle"
          commandfor="admin-route-tabs"
          value="activity"
        >Activity</nve-tabs-item>
        <nve-tabs-item
          command="--toggle"
          commandfor="admin-route-tabs"
          value="access"
        >Access</nve-tabs-item>
      </nve-tabs>
      <section slot="overview" nve-layout="column gap:lg">
        <div nve-layout="grid gap:lg span-items:4 align:vertical-stretch">
          <nve-card>
            <nve-card-header><h2 nve-text="label muted">Requests today</h2></nve-card-header>
            <nve-card-content>
              <div nve-layout="column gap:xs">
                <p nve-text="heading lg">2.4M</p>
                <p nve-text="body sm muted">12% above the daily average</p>
              </div>
            </nve-card-content>
          </nve-card>
          <nve-card>
            <nve-card-header><h2 nve-text="label muted">Success rate</h2></nve-card-header>
            <nve-card-content>
              <div nve-layout="column gap:xs">
                <p nve-text="heading lg">99.98%</p>
                <p nve-text="body sm muted">Within the 99.9% target</p>
              </div>
            </nve-card-content>
          </nve-card>
          <nve-card>
            <nve-card-header><h2 nve-text="label muted">P95 latency</h2></nve-card-header>
            <nve-card-content>
              <div nve-layout="column gap:xs">
                <p nve-text="heading lg">182 ms</p>
                <p nve-text="body sm muted">18 ms below the alert threshold</p>
              </div>
            </nve-card-content>
          </nve-card>
        </div>
        <nve-card>
          <nve-card-header>
            <div nve-layout="column gap:xs">
              <h2 nve-text="heading sm">Service details</h2>
              <p nve-text="body sm muted">Current production configuration.</p>
            </div>
          </nve-card-header>
          <nve-card-content>
            <dl nve-layout="grid gap:sm">
              <dt nve-layout="span:4" nve-text="body muted medium">Region</dt>
              <dd nve-layout="span:8" nve-text="body">us-central-1</dd>
              <dt nve-layout="span:4" nve-text="body muted medium">Model</dt>
              <dd nve-layout="span:8" nve-text="body">Llama 3.3 70B Instruct</dd>
              <dt nve-layout="span:4" nve-text="body muted medium">Deployment</dt>
              <dd nve-layout="span:8" nve-text="body">inference-api-v42</dd>
            </dl>
          </nve-card-content>
        </nve-card>
      </section>
      <section slot="activity" nve-layout="column gap:md">
        <nve-grid>
          <nve-grid-header>
            <nve-grid-column width="25%">Event</nve-grid-column>
            <nve-grid-column width="25%">Actor</nve-grid-column>
            <nve-grid-column width="25%">Time</nve-grid-column>
            <nve-grid-column width="25%">Status</nve-grid-column>
          </nve-grid-header>
          <nve-grid-row>
            <nve-grid-cell>Deployed inference-api-v42</nve-grid-cell>
            <nve-grid-cell>Maya Kim</nve-grid-cell>
            <nve-grid-cell>18 minutes ago</nve-grid-cell>
            <nve-grid-cell><nve-badge status="success" container="flat">Completed</nve-badge></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell>Updated autoscaling target</nve-grid-cell>
            <nve-grid-cell>Jon Bell</nve-grid-cell>
            <nve-grid-cell>2 hours ago</nve-grid-cell>
            <nve-grid-cell><nve-badge status="finished" container="flat">Applied</nve-badge></nve-grid-cell>
          </nve-grid-row>
          <nve-grid-row>
            <nve-grid-cell>Rotated service credentials</nve-grid-cell>
            <nve-grid-cell>System</nve-grid-cell>
            <nve-grid-cell>Yesterday</nve-grid-cell>
            <nve-grid-cell><nve-badge status="finished" container="flat">Applied</nve-badge></nve-grid-cell>
          </nve-grid-row>
        </nve-grid>
      </section>
      <section slot="access" nve-layout="column gap:md">
        <div nve-layout="grid gap:lg span-items:6 align:vertical-stretch">
          <nve-card>
            <nve-card-header>
              <div nve-layout="row gap:sm align:space-between align:vertical-center">
                <h3 nve-text="heading xs">Platform administrators</h3>
                <nve-badge container="flat">Owner</nve-badge>
              </div>
            </nve-card-header>
            <nve-card-content>
              <p nve-text="body sm muted">12 members can deploy, configure, and manage access.</p>
            </nve-card-content>
          </nve-card>
          <nve-card>
            <nve-card-header>
              <div nve-layout="row gap:sm align:space-between align:vertical-center">
                <h3 nve-text="heading xs">ML operations</h3>
                <nve-badge container="flat">Editor</nve-badge>
              </div>
            </nve-card-header>
            <nve-card-content>
              <p nve-text="body sm muted">28 members can deploy and update service configuration.</p>
            </nve-card-content>
          </nve-card>
        </div>
      </section>
    </nve-tabs-group>
  </main>
</nve-page>
    `
  }
};
