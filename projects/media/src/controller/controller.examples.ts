// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/Controller',
  component: 'nve-media-controller'
};

/**
 * @summary Controller composition with consumer-owned video and controls. Use this when applications need native media markup with Elements playback controls.
 */
export const Default = {
  render: () => html`
<div nve-layout="column gap:none" style="width: 550px">
  <nve-media-controller id="example-media">
    <video src="/static/video/particle.mp4" playsinline></video>
  </nve-media-controller>
  <nve-media-time-range commandfor="example-media" name="currentTime"></nve-media-time-range>
  <div nve-layout="row gap:xs align:wrap full">
    <nve-media-seek-button commandfor="example-media" action="start"></nve-media-seek-button>
    <nve-media-seek-button commandfor="example-media" action="backward" value="3"></nve-media-seek-button>
    <nve-media-pause-button commandfor="example-media" name="paused" checked value="true"></nve-media-pause-button>
    <nve-media-seek-button commandfor="example-media" action="forward" value="3"></nve-media-seek-button>
    <nve-media-seek-button commandfor="example-media" action="end"></nve-media-seek-button>
    <nve-media-mute-button commandfor="example-media" name="muted" value="true" style="margin-left: auto"></nve-media-mute-button>
    <nve-media-volume-range commandfor="example-media" name="volume" style="max-width: 100px"></nve-media-volume-range>
    <nve-media-playback-rate-select commandfor="example-media" name="playbackRate"></nve-media-playback-rate-select>
    <nve-media-fullscreen-button commandfor="example-media"></nve-media-fullscreen-button>
  </div>
</div>
  `
};

/**
 * @summary Controller composition with command-only controls. Use this when applications need to send media commands directly to the controller.
 * @tags test-case
 */
export const Commands = {
  render: () => html`
<nve-media-controller id="command-controller" style="width: 520px; margin-bottom: 12px">
  <video src="/static/video/particle.mp4" playsinline></video>
</nve-media-controller>
<div nve-layout="row gap:xs align:wrap" style="width: 520px">
  <button commandfor="command-controller" command="--play">play</button>
  <button commandfor="command-controller" command="--pause">pause</button>
  <button commandfor="command-controller" command="--toggle-play">toggle play</button>
  <button commandfor="command-controller" command="--mute">mute</button>
  <button commandfor="command-controller" command="--unmute">unmute</button>
  <button commandfor="command-controller" command="--toggle-mute">toggle mute</button>
  <button commandfor="command-controller" command="--seek" value="5">seek (5 seconds)</button>
  <button commandfor="command-controller" command="--seek-start">seek start (0 seconds)</button>
  <button commandfor="command-controller" command="--seek-end">seek end (duration)</button>
  <button commandfor="command-controller" command="--seek-backward" value="2">seek backward (2 seconds)</button>
  <button commandfor="command-controller" command="--seek-forward" value="2">seek forward (2 seconds)</button>
  <button commandfor="command-controller" command="--set-volume" value="0.5">set volume (0.5)</button>
  <button commandfor="command-controller" command="--set-playback-rate" value="1.0">set playback rate (1.0)</button>
  <button commandfor="command-controller" command="--enter-fullscreen">enter fullscreen</button>
  <button commandfor="command-controller" command="--exit-fullscreen">exit fullscreen</button>
  <button commandfor="command-controller" command="--toggle-fullscreen">toggle fullscreen</button>
</div>
  `
};

/**
 * @summary Form-associated media controls report values through native FormData. Use this when playback settings should join standard form workflows.
 */
export const FormValues = {
  render: () => html`
<form id="controller-form" nve-layout="column gap:none" style="width: 550px">
  <nve-media-controller id="form-example-media">
    <video src="/static/video/particle.mp4" playsinline></video>
  </nve-media-controller>
  <nve-media-time-range commandfor="form-example-media" name="currentTime"></nve-media-time-range>
  <div nve-layout="row gap:xs align:wrap full pad-bottom:md">
    <nve-media-seek-button commandfor="form-example-media" action="start"></nve-media-seek-button>
    <nve-media-seek-button commandfor="form-example-media" action="backward" value="3"></nve-media-seek-button>
    <nve-media-pause-button commandfor="form-example-media" name="paused" checked value="true"></nve-media-pause-button>
    <nve-media-seek-button commandfor="form-example-media" action="forward" value="3"></nve-media-seek-button>
    <nve-media-seek-button commandfor="form-example-media" action="end"></nve-media-seek-button>
    <nve-media-mute-button commandfor="form-example-media" name="muted" value="true" style="margin-left: auto"></nve-media-mute-button>
    <nve-media-volume-range commandfor="form-example-media" name="volume" style="max-width: 100px"></nve-media-volume-range>
    <nve-media-playback-rate-select commandfor="form-example-media" name="playbackRate"></nve-media-playback-rate-select>
    <nve-media-fullscreen-button commandfor="form-example-media"></nve-media-fullscreen-button>
  </div>
  <pre></pre>
</form>
<script type="module">
  const form = document.querySelector('#controller-form');
  const pre = document.querySelector('#controller-form pre');
  pre.innerText = JSON.stringify({ currentTime: 0, volume: 1, playbackRate: 1 }, null, 2);
  form.addEventListener('input', () => {
    const values = Object.fromEntries(new FormData(form).entries());
    pre.innerText = JSON.stringify(values, null, 2);
  });
</script>
  `
};

/**
 * @summary Standard video player with playback controls, timeline scrubber, and volume controls. Use for reviewing recorded sensor data, simulation playback, or training video content.
 */
export const Card = {
  render: () => html`
    <nve-card style="width: 550px">
      <nve-media-controller id="card-controller">
        <video src="/static/video/particle.mp4" playsinline></video>
      </nve-media-controller>
      <nve-card-content role="toolbar" aria-label="media controls" style="--padding: var(--nve-ref-size-200) var(--nve-ref-size-400) var(--nve-ref-size-400) var(--nve-ref-size-400)">
        <nve-media-time-range commandfor="card-controller" name="currentTime"></nve-media-time-range>
        <div nve-layout="row gap:xs align:wrap full">
          <nve-media-seek-button commandfor="card-controller" action="start"></nve-media-seek-button>
          <nve-media-seek-button commandfor="card-controller" action="backward" value="3"></nve-media-seek-button>
          <nve-media-pause-button commandfor="card-controller" name="paused" checked value="true"></nve-media-pause-button>
          <nve-media-seek-button commandfor="card-controller" action="forward" value="3"></nve-media-seek-button>
          <nve-media-seek-button commandfor="card-controller" action="end"></nve-media-seek-button>
          <nve-media-mute-button commandfor="card-controller" name="muted" value="true" style="margin-left: auto"></nve-media-mute-button>
          <nve-media-volume-range commandfor="card-controller" name="volume" style="max-width: 100px"></nve-media-volume-range>
          <nve-media-playback-rate-select commandfor="card-controller" name="playbackRate"></nve-media-playback-rate-select>
          <nve-media-fullscreen-button commandfor="card-controller"></nve-media-fullscreen-button>
        </div>
      </nve-card-content>
    </nve-card>
  `
};
