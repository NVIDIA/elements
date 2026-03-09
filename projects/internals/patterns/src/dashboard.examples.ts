import { html } from 'lit';

export default {
  title: 'Patterns/Dashboard',
  component: 'nve-patterns'
};

/**
 * @summary Dashboard masonry layout for monitoring workflows with KPI cards, sparkline trends, and a checkpoint evaluation grid. Use for real-time operational views where users need to scan progress and spot anomalies at a glance.
 * @tags pattern
 */
export const Dashboard = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Infrastructure</h2>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg">
    <section nve-layout="column gap:sm">
      <h2 nve-text="heading">Model 70B Fine-tune</h2>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-badge status="running">Training</nve-badge>
        <span nve-text="label sm muted">Epoch 14 / 20</span>
        <nve-divider orientation="vertical"></nve-divider>
        <span nve-text="label sm muted">ETA: 4h 23m</span>
      </div>
    </section>
    <section nve-layout="grid gap:lg span-items:6">
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
    <section nve-layout="grid gap:lg span-items:4">
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
          <nve-grid-column>BLEU Score Trend</nve-grid-column>
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
          <nve-grid-cell>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm">42.8</span>
              <nve-sparkline data="[28, 32, 36, 38, 40, 41, 42.8]" mark="line" interpolation="smooth" status="success" size="md"></nve-sparkline>
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
          <nve-grid-cell>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm">41.2</span>
              <nve-sparkline data="[28, 32, 36, 38, 40, 41.2]" mark="line" interpolation="smooth" status="success" size="md"></nve-sparkline>
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
          <nve-grid-cell>
            <div nve-layout="row gap:sm align:vertical-center">
              <span nve-text="label sm">35.6</span>
              <nve-sparkline data="[28, 32, 35.6]" mark="line" interpolation="smooth" size="md"></nve-sparkline>
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
        <div nve-layout="grid span-items:4 gap:lg">
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
}