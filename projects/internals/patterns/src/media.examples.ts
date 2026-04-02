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
 * @summary Playback transport controls with start, rewind, play, fast forward, and end buttons in a flat button group. Use as the core navigation component in media players, simulation reviewers, or timeline-based interfaces.
 * @tags pattern
 */
export const PlaybackControl = {
  render: () => html`
<nve-button-group aria-label="playback controls" container="flat">
  <nve-icon-button aria-label="go to start" icon-name="start" size="sm"></nve-icon-button>
  <nve-icon-button aria-label="rewind" icon-name="rewind" size="sm"></nve-icon-button>
  <nve-icon-button aria-label="play" icon-name="play" size="sm"></nve-icon-button>
  <nve-icon-button aria-label="fast forward" icon-name="fast-forward" size="sm"></nve-icon-button>
  <nve-icon-button aria-label="go to end" icon-name="start" direction="down" size="sm"></nve-icon-button>
</nve-button-group>
  `
};

/**
 * @summary Playback speed control using a rounded button group with preset speed options for audio and video playback. Use when toolbar space allows discrete speed buttons and users need to see all options at once.
 * @tags pattern
 */
export const PlaybackSpeedControl = {
  render: () => html`
<nve-button-group aria-label="playback speed" container="rounded">
  <nve-button size="sm">0.5x</nve-button>
  <nve-button size="sm" pressed>1x</nve-button>
  <nve-button size="sm">2x</nve-button>
  <nve-button size="sm">4x</nve-button>
</nve-button-group>
  `
};

/**
 * @summary Compact playback speed control using a flat select dropdown for audio and video playback. Use when toolbar space is tight and a dropdown works better than a button group for speed selection.
 * @tags pattern
 */
export const PlaybackSpeedMenuControl = {
  render: () => html`
<nve-select container="flat" style="--width: 70px">
  <select aria-label="playback speed">
    <option value="0.5">0.5x</option>
    <option value="1">1x</option>
    <option value="1.5">1.5x</option>
    <option value="2">2x</option>
  </select>
</nve-select>
  `
};

/**
 * @summary Volume control with mute toggle and range slider for audio playback. Use in media players, video reviewers, or any interface where users need fine-grained audio level control.
 * @tags pattern
 */
export const VolumeControl = {
  render: () => html`
<div aria-label="volume controls" role="group" nve-layout="row gap:xs align:vertical-center">
  <nve-icon-button aria-label="mute volume" icon-name="volume" size="sm" container="flat"></nve-icon-button>
  <nve-range>
    <input aria-label="volume" type="range" min="0" max="100" value="80" />
  </nve-range>
</div>
  `
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
 * @summary Time scrubber with current position, range slider, and total duration for audio and video playback. Use in media players where users need to seek to a specific timestamp or scan through recorded content.
 * @tags pattern
 */
export const TimeScrubberControl = {
  render: () => html`
<div aria-label="time scrubber controls" role="group" nve-layout="row gap:sm align:vertical-center">
  <time datetime="00:14:23" nve-text="body sm muted">00:14:23</time>
  <nve-range>
    <input aria-label="playback time" type="range" min="0" max="6300" value="890" />
  </nve-range>
  <time datetime="01:45:00" nve-text="body sm muted">01:45:00</time>
</div>
  `
};

/**
 * @summary Standard video player with playback controls, timeline scrubber, and volume controls. Use for reviewing recorded sensor data, simulation playback, or training video content.
 * @tags pattern
 */
export const VideoPlayerCard = {
  render: () => html`
<nve-card style="max-width: 520px">
  <video style="aspect-ratio: 16 / 9; background: var(--nve-ref-color-alpha-black-700)"></video>
  <nve-card-content>
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
        <nve-divider orientation="vertical"></nve-divider>
        <div role="group" aria-label="volume controls" nve-layout="row gap:xs align:vertical-center">
          <nve-icon-button aria-label="mute volume" icon-name="volume" size="sm" container="flat"></nve-icon-button>
          <nve-range>
            <input type="range" min="0" max="100" value="50" aria-label="Volume" />
          </nve-range>
        </div>
        <nve-select container="flat" style="--width: 70px">
          <select aria-label="playback speed">
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </nve-select>
        <nve-icon-button aria-label="fullscreen" icon-name="maximize" size="sm" container="flat"></nve-icon-button>
      </nve-toolbar>
    </div>
  </nve-card-content>
</nve-card>
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
      <nve-icon-button aria-label="download audio" popovertarget="download-audio" icon-name="download" size="sm" container="flat"></nve-icon-button>
      <nve-tooltip id="download-audio">Download Audio</nve-tooltip>
    </div>
  </nve-card-header>
  <nve-card-content>
    <div role="group" aria-label="time scrubber controls" nve-layout="row gap:sm align:vertical-center full pad-y:md">
      <time datetime="00:03.2" nve-text="body sm muted">00:03.2</time>
      <nve-range>
        <input aria-label="playback time" type="range" min="0" max="920" value="320" />
      </nve-range>
      <time datetime="00:09.2" nve-text="body sm muted">00:09.2</time>
    </div>
  </nve-card-content>
  <nve-card-footer>
    <nve-toolbar container="inset">
      <nve-button-group aria-label="playback controls" container="flat">
        <nve-icon-button aria-label="go to start" icon-name="start" size="sm"></nve-icon-button>
        <nve-icon-button aria-label="play" icon-name="play" size="sm"></nve-icon-button>
        <nve-icon-button aria-label="go to end" icon-name="start" direction="down" size="sm"></nve-icon-button>
      </nve-button-group>
      <nve-divider orientation="vertical"></nve-divider>
      <div role="group" aria-label="volume controls" nve-layout="row gap:xs align:vertical-center">
        <nve-icon-button aria-label="mute volume" icon-name="volume" size="sm" container="flat"></nve-icon-button>
        <nve-range>
          <input type="range" min="0" max="100" value="50" aria-label="Volume" />
        </nve-range>
      </div>
      <nve-divider orientation="vertical"></nve-divider>
      <nve-button-group aria-label="playback speed" container="rounded">
        <nve-button size="sm">0.5x</nve-button>
        <nve-button size="sm" pressed>1x</nve-button>
        <nve-button size="sm">2x</nve-button>
        <nve-button size="sm">4x</nve-button>
      </nve-button-group>
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
