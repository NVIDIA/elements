import { html } from 'lit';
import '@nvidia-elements/core/avatar/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/sort-button/define.js';

export default {
  title: 'Patterns/Examples',
  component: 'nve-patterns'
};

/**
 * @summary Horizontal list item card with thumbnail, title, description, and icon button actions for browsable content lists.
 * @tags pattern test-case
 */
export const ContentRow = {
  render: () => html`
  <nve-card role="listitem" container="full">
    <nve-card-content>
      <div nve-layout="grid align:vertical-center align:space-between gap:md">
        <div nve-layout="span:4 row gap:md align:vertical-center">
          <img src="https://placehold.co/600x400" alt="placeholder" style="max-width: 100px; border-radius: var(--nve-ref-border-radius-sm)" />
          <div nve-layout="column gap:sm">
            <h2 nve-text="label medium">Activity Dashboard</h2>
            <p nve-text="body sm muted">Last saved: Oct 19, 21 by Camru</p>
          </div>
        </div>
        <p nve-text="body sm" nve-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP</p>
        <div nve-layout="span:3 row gap:sm align:right">
          <div nve-layout="row gap:xs">
            <nve-icon-button icon-name="eye"></nve-icon-button>
            <nve-icon-button icon-name="copy"></nve-icon-button>
            <nve-icon-button icon-name="delete"></nve-icon-button>
          </div>
          <nve-divider orientation="vertical"></nve-divider>
          <nve-button>Add Panel</nve-button>
        </div>
      </div>
    </nve-card-content>
  </nve-card>
  `
}

/**
 * @summary Project board with workflow stage columns for tracking items through a workflow / process pipeline. Use for project management views where teams need to visualize work-in-progress across sequential stages like build, test, and merge workflows.
 * @tags pattern
 */
export const ProjectBoard = {
  render: () => html`
    <nve-page style="height: 100% !important;">
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
