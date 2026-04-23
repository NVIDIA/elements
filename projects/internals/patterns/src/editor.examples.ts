// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/tree/define.js';
import '@nvidia-elements/monaco/input/define.js';
import '@nvidia-elements/monaco/editor/define.js';
import '@nvidia-elements/monaco/diff-input/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page-header/define.js';

export default {
  title: 'Patterns/Examples',
  component: 'nve-patterns'
};

/**
 * @summary IDE-style layout with file tree navigation, code editor, and output panel. Ideal for browsing and editing AV sensor configuration files in a familiar development environment.
 * @tags pattern
 */
export const FileBrowser = {
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
          av-prototype-042/
          <nve-tree-node expanded>
            sensors/
            <nve-tree-node><a href="#" class="file-link" data-file="lidar">lidar_config.py</a></nve-tree-node>
            <nve-tree-node><a href="#" class="file-link" data-file="camera">camera_config.py</a></nve-tree-node>
            <nve-tree-node><a href="#" class="file-link" data-file="radar">radar_config.py</a></nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            perception/
            <nve-tree-node><a href="#">detection.py</a></nve-tree-node>
            <nve-tree-node><a href="#">tracking.py</a></nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            planning/
            <nve-tree-node><a href="#">route_planner.py</a></nve-tree-node>
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

@dataclass
class LidarProcessingConfig:
    &quot;&quot;&quot;Point cloud processing parameters.&quot;&quot;&quot;
    
    voxel_size: float = 0.1
    ground_removal: bool = True
    ground_threshold: float = 0.3
    clustering_eps: float = 0.5
    min_cluster_size: int = 10
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
 * @summary Side-by-side diff view for comparing configuration changes between releases. Essential for reviewing updates before deploying new AV sensor calibrations or robot parameters.
 * @tags pattern
 */
export const DiffView = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Sensor Calibration</h2>
    <nve-icon-button slot="suffix" interaction="emphasis" size="sm">AV</nve-icon-button>
  </nve-page-header>

  <nve-toolbar container="full" slot="subheader">
    <nve-icon-button slot="prefix" icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
    <h2 slot="prefix" nve-text="heading sm">sensor_params.yaml</h2>
    <nve-badge slot="prefix">+12 / -4</nve-badge>
    <nve-button-group slot="suffix" container="rounded" behavior-select="single">
      <nve-icon-button icon-name="split-vertical" size="sm" pressed></nve-icon-button>
      <nve-icon-button icon-name="category-list" size="sm"></nve-icon-button>
    </nve-button-group>
    <nve-divider slot="suffix" orientation="vertical"></nve-divider>
    <nve-button slot="suffix">Approve Changes</nve-button>
    <nve-button slot="suffix">Merge</nve-button>
  </nve-toolbar>

  <main nve-layout="column">
    <nve-toolbar container="full" style="--background: var(--nve-sys-layer-canvas-accent-background)">
      <div slot="prefix" nve-layout="row gap:sm align:vertical-center">
        <nve-icon-button icon-name="branch" size="sm" container="flat"></nve-icon-button>
        <span nve-text="body sm">release/v2.3.0</span>
      </div>
      <nve-icon-button icon-name="arrow" direction="right" size="sm" container="flat"></nve-icon-button>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-icon-button icon-name="branch" size="sm" container="flat"></nve-icon-button>
        <span nve-text="body sm">feature/lidar-calibration</span>
      </div>
    </nve-toolbar>
    <nve-monaco-diff-input
      language="yaml"
      line-numbers="on"
      side-by-side
      readonly
      style="flex: 1; --min-height: 100%; --border-radius: 0;"
      original="# Sensor Parameters - v2.3.0
# Last updated: 2025-12-15

lidar:
  front:
    model: Velodyne-128
    range_max: 100.0
    fov_horizontal: 360.0
    fov_vertical: 40.0
    rotation_rate: 10
    
    calibration:
      roll: 0.0
      pitch: 0.0
      yaw: 0.0
      x_offset: 2.1
      y_offset: 0.0
      z_offset: 1.73

camera:
  front_center:
    model: NVIDIA-Hawk
    resolution: [1920, 1080]
    fps: 30
    
    intrinsics:
      fx: 1450.0
      fy: 1450.0
      cx: 960.0
      cy: 540.0
    
    distortion: [0.0, 0.0, 0.0, 0.0, 0.0]

radar:
  front:
    model: Continental-ARS540
    range_max: 250.0
    enabled: true
"
      value="# Sensor Parameters - v2.4.0
# Last updated: 2026-01-08
# Updated LIDAR calibration from field test

lidar:
  front:
    model: Velodyne-128
    range_max: 120.0  # increased from 100m
    fov_horizontal: 360.0
    fov_vertical: 40.0
    rotation_rate: 20  # increased to 20Hz
    points_per_second: 300000  # NEW
    
    calibration:
      roll: 0.0
      pitch: -0.5  # adjusted from field calibration
      yaw: 0.12  # adjusted from field calibration
      x_offset: 2.1
      y_offset: 0.0
      z_offset: 1.8  # corrected mounting height

camera:
  front_center:
    model: NVIDIA-Hawk
    resolution: [1920, 1080]
    fps: 30
    
    intrinsics:
      fx: 1452.3  # refined from calibration
      fy: 1451.8  # refined from calibration
      cx: 962.1
      cy: 541.3
    
    distortion: [-0.012, 0.003, 0.0, 0.0, 0.0]

radar:
  front:
    model: Continental-ARS540
    range_max: 300.0  # increased range
    enabled: true
"
    ></nve-monaco-diff-input>
  </main>

  <nve-toolbar slot="subfooter">
    <nve-icon-button icon-name="information-circle-stroke" size="sm" container="flat"></nve-icon-button>
    <span nve-text="body sm muted">Comparing release/v2.3.0 to feature/lidar-calibration</span>
    <span slot="suffix" nve-text="body sm nowrap">12 additions, 4 modifications</span>
  </nve-toolbar>
</nve-page>
  `
};

/**
 * @summary Use for reviewing deployed configurations or viewing session logs in a read-only code viewer. Prevents accidental edits while allowing full code navigation and search.
 * @tags pattern
 */
export const ReadOnly = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Session Viewer</h2>
    <nve-icon-button slot="suffix" icon-name="download" container="flat"></nve-icon-button>
    <nve-icon-button slot="suffix" icon-name="copy" container="flat"></nve-icon-button>
    <nve-icon-button slot="suffix" interaction="emphasis" size="sm">RB</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="row align:space-between align:vertical-center">
        <section nve-layout="row gap:sm align:vertical-center">
          <nve-icon-button icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
          <h2 nve-text="heading lg">Test Session #2847</h2>
          <nve-badge status="success">completed</nve-badge>
        </section>
        <section nve-layout="row gap:sm align:vertical-center">
          <nve-button container="flat">View Raw</nve-button>
          <nve-button>Export Report</nve-button>
        </section>
      </div>
      <section nve-layout="row gap:xl align:vertical-center pad-top:sm">
        <div nve-layout="row gap:sm align:center">
          <span nve-text="body sm muted">Robot</span>
          <span nve-text="body sm bold">isaac-manipulator-07</span>
        </div>
        <div nve-layout="row gap:sm align:center">
          <span nve-text="body sm muted">Duration</span>
          <span nve-text="body sm bold">4h 23m</span>
        </div>
        <div nve-layout="row gap:sm align:center">
          <span nve-text="body sm muted">Started</span>
          <span nve-text="body sm bold">Jan 8, 2026 09:15</span>
        </div>
      </section>
    </nve-page-panel-content>
  </nve-page-panel>

  <nve-page-panel slot="left" size="sm" expandable>
    <nve-page-panel-content>
      <nve-tree behavior-expand>
        <nve-tree-node expanded>
          session-2847/
          <nve-tree-node><a href="#">robot_config.yaml</a></nve-tree-node>
          <nve-tree-node expanded>
            logs/
            <nve-tree-node><a href="#">motion_log.txt</a></nve-tree-node>
            <nve-tree-node><a href="#">sensor_log.txt</a></nve-tree-node>
            <nve-tree-node><a href="#">errors.txt</a></nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            results/
            <nve-tree-node><a href="#">metrics.json</a></nve-tree-node>
          </nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-page-panel-content>
  </nve-page-panel>

  <main nve-layout="column" style="height: 100%">
    <nve-toolbar container="full">
      <nve-tabs behavior-select>
        <nve-tabs-item selected>robot_config.yaml</nve-tabs-item>
      </nve-tabs>
      <nve-icon-button slot="suffix" icon-name="lock" size="sm" container="flat" disabled></nve-icon-button>
      <span slot="suffix" nve-text="body sm muted nowrap">Read-only</span>
    </nve-toolbar>
    <nve-monaco-input
      language="yaml"
      line-numbers="on"
      folding
      readonly
      style="flex: 1; --min-height: 100%; --border-radius: 0;"
      value="# Robot Configuration - Session #2847
# Generated: 2026-01-08T09:15:00Z
# WARNING: This is a deployed configuration snapshot

robot:
  name: isaac-manipulator-07
  serial: IM-2024-0742
  firmware: 3.2.1

joints:
  - name: base_rotation
    type: revolute
    limits: [-180.0, 180.0]  # degrees
    max_velocity: 120.0  # deg/s
    max_acceleration: 300.0
    
  - name: shoulder
    type: revolute
    limits: [-90.0, 90.0]
    max_velocity: 90.0
    max_acceleration: 200.0
    
  - name: elbow
    type: revolute
    limits: [-135.0, 135.0]
    max_velocity: 120.0
    max_acceleration: 300.0
    
  - name: wrist_pitch
    type: revolute
    limits: [-90.0, 90.0]
    max_velocity: 180.0
    max_acceleration: 400.0
    
  - name: wrist_roll
    type: continuous
    max_velocity: 360.0
    max_acceleration: 720.0
    
  - name: gripper
    type: prismatic
    limits: [0.0, 0.08]  # meters
    max_velocity: 0.1
    max_force: 100.0  # Newtons

motion_planning:
  planner: RRTConnect
  planning_time: 5.0
  goal_tolerance: 0.001
  collision_checking: true
  
safety:
  emergency_stop_enabled: true
  force_limit: 150.0
  workspace_bounds:
    x: [-1.0, 1.0]
    y: [-1.0, 1.0]
    z: [0.0, 1.5]
"></nve-monaco-input>
  </main>

  <nve-toolbar slot="subfooter">
    <nve-icon-button icon-name="information-circle-stroke" size="sm" container="flat"></nve-icon-button>
    <span nve-text="body sm muted">Deployed config snapshot, editing disabled</span>
  </nve-toolbar>
</nve-page>
  `
};
