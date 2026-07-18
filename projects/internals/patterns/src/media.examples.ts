// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/tree/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/resize-handle/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/progress-bar/define.js';

export default {
  title: 'Patterns/Media',
  component: 'nve-patterns'
};

/**
 * @summary Zoom level control with zoom-out, range slider, and zoom-in buttons for video and canvas content. Use in media viewers, map interfaces, or image editors where users need precise zoom control.
 * @tags pattern
 */
export const ZoomControl = {
  render: () => html`
<div aria-label="zoom level controls" role="group" nve-layout="row gap:xs align:vertical-center">
  <nve-icon-button aria-label="zoom out" icon-name="zoom-out" size="sm" container="flat"></nve-icon-button>
  <nve-range>
    <input aria-label="zoom level" type="range" min="0" max="200" value="100" />
  </nve-range>
  <nve-icon-button aria-label="zoom in" icon-name="zoom-in" size="sm" container="flat"></nve-icon-button>
</div>
  `
};

/**
 * @summary Compact audio player controls with playback controls, and timestamp display. Ideal for reviewing audio logs, voice commands, or alert sounds.
 * @tags pattern
 */
export const AudioPlayerCard = {
  render: () => html`
<nve-card style="max-width: 520px">
  <nve-card-header>
    <div nve-layout="row gap:md align:vertical-center align:space-between full">
      <div nve-layout="column gap:xs">
        <span nve-text="body bold">event-recording-042.mp4</span>
        <time datetime="2026-01-08 14:23:56" nve-text="body sm muted">2026-01-08 14:23:56</time>
      </div>
      <nve-icon-button aria-label="download audio" icon-name="download" size="sm" container="flat"></nve-icon-button>
    </div>
  </nve-card-header>
  <nve-card-content>
    <div role="group" aria-label="time scrubber controls" nve-layout="row gap:sm align:vertical-center full pad-y:md">
      <time datetime="00:03.2" nve-text="body sm muted">00:03.2</time>
      <nve-media-time-range min="0" max="920" value="320"></nve-media-time-range>
      <time datetime="00:09.2" nve-text="body sm muted">00:09.2</time>
    </div>
  </nve-card-content>
  <nve-card-footer>
    <nve-toolbar container="inset">
      <nve-media-seek-button action="start"></nve-media-seek-button>
      <nve-media-seek-button action="backward" value="3"></nve-media-seek-button>
      <nve-media-pause-button name="paused" checked></nve-media-pause-button>
      <nve-media-seek-button action="forward" value="3"></nve-media-seek-button>
      <nve-media-seek-button action="end"></nve-media-seek-button>
      <div role="group" aria-label="volume controls" nve-layout="row gap:sm align:vertical-center" style="margin-left: auto">
        <nve-media-mute-button name="muted"></nve-media-mute-button>
        <nve-media-volume-range name="volume" value="0.5"></nve-media-volume-range>
        <nve-media-playback-rate-select name="playbackRate"></nve-media-playback-rate-select>
      </div>
    </nve-toolbar>
  </nve-card-footer>
</nve-card>
  `
};

/**
 * @summary Full-page video player layout with metadata panel and playback controls. Use for reviewing recordings that requires detailed contextual information.
 * @tags pattern
 */
export const PageLayoutVideo = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-button selected container="flat">Link 1</nve-button>
    <nve-button container="flat">Link 2</nve-button>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="column gap:md align:stretch">
        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm" container="flat"></nve-icon-button>
            <h2 nve-text="heading sm">event-recording-042.mp4</h2>
          </section>
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button aria-label="additional options" icon-name="more-actions"></nve-icon-button>
          </section>
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
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">Annotations</span>
          <span nve-text="body sm">temporary</span>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>

  <nve-media-controller id="page-controller" style="width: 100%; height: 100%">
    <video src="/static/video/particle.mp4" playsinline></video>
  </nve-media-controller>

  <nve-page-panel slot="bottom" style="max-height: 100px">
    <nve-page-panel-content>
      <div nve-layout="column gap:sm full">
        <div role="group" aria-label="time scrubber controls" nve-layout="row gap:sm align:vertical-center full">
          <time datetime="00:14:23" nve-text="body sm muted">00:14:23</time>
          <nve-media-time-range commandfor="page-controller" min="0" max="6300" value="890"></nve-media-time-range>
          <time datetime="01:45:00" nve-text="body sm muted">01:45:00</time>
        </div>
        <nve-toolbar aria-label="video control options" container="inset">
          <nve-button-group container="flat" aria-label="playback controls">
            <nve-media-seek-button commandfor="page-controller" action="start"></nve-media-seek-button>
            <nve-media-seek-button commandfor="page-controller" action="backward" value="3"></nve-media-seek-button>
            <nve-media-pause-button commandfor="page-controller" name="paused" checked></nve-media-pause-button>
            <nve-media-seek-button commandfor="page-controller" action="forward" value="3"></nve-media-seek-button>
            <nve-media-seek-button commandfor="page-controller" action="end"></nve-media-seek-button>
          </nve-button-group>
          <nve-media-mute-button commandfor="page-controller" name="muted" slot="suffix"></nve-media-mute-button>
          <nve-media-volume-range commandfor="page-controller" name="volume" value="0.5" slot="suffix" style="width: 130px"></nve-media-volume-range>
          <nve-media-playback-rate-select commandfor="page-controller" name="playbackRate" slot="suffix"></nve-media-playback-rate-select>
          <nve-media-fullscreen-button commandfor="page-controller" slot="suffix"></nve-media-fullscreen-button>
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
