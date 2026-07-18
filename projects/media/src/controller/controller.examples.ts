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
<div nve-layout="column gap:md" style="width: 560px">
  <nve-media-controller id="example-controller">
    <video src="/static/video/particle.mp4" playsinline></video>
  </nve-media-controller>
  <nve-toolbar aria-label="media controls">
    <nve-media-seek-button commandfor="example-controller" action="start"></nve-media-seek-button>
    <nve-media-seek-button commandfor="example-controller" action="backward" value="3"></nve-media-seek-button>
    <nve-media-pause-button commandfor="example-controller" name="paused" value="true" checked></nve-media-pause-button>
    <nve-media-seek-button commandfor="example-controller" action="forward" value="3"></nve-media-seek-button>
    <nve-media-seek-button commandfor="example-controller" action="end"></nve-media-seek-button>
    <nve-media-time-range commandfor="example-controller" name="currentTime"></nve-media-time-range>
    <nve-media-mute-button commandfor="example-controller" name="muted" value="true"></nve-media-mute-button>
    <nve-media-volume-range commandfor="example-controller" name="volume"></nve-media-volume-range>
    <nve-media-playback-rate-select commandfor="example-controller" name="playbackRate"></nve-media-playback-rate-select>
    <nve-media-fullscreen-button commandfor="example-controller"></nve-media-fullscreen-button>
  </nve-toolbar>
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
<form id="controller-form" nve-layout="row gap:md">
  <div nve-layout="column gap:none" style="min-width: 520px">
    <nve-media-controller id="form-example-controller">
      <video src="/static/video/particle.mp4" playsinline></video>
    </nve-media-controller>
    <nve-media-time-range commandfor="form-example-controller" name="currentTime"></nve-media-time-range>
    <div nve-layout="row gap:xs align:wrap full">
      <nve-media-seek-button commandfor="form-example-controller" action="start"></nve-media-seek-button>
      <nve-media-seek-button commandfor="form-example-controller" action="backward" value="3"></nve-media-seek-button>
      <nve-media-pause-button commandfor="form-example-controller" name="paused" checked value="true"></nve-media-pause-button>
      <nve-media-seek-button commandfor="form-example-controller" action="forward" value="3"></nve-media-seek-button>
      <nve-media-seek-button commandfor="form-example-controller" action="end"></nve-media-seek-button>
      <div nve-layout="row gap:xs" style="margin-left: auto">
        <nve-media-mute-button commandfor="form-example-controller" name="muted" value="true"></nve-media-mute-button>
        <nve-media-volume-range commandfor="form-example-controller" name="volume"></nve-media-volume-range>
      </div>
      <nve-media-playback-rate-select commandfor="form-example-controller" name="playbackRate"></nve-media-playback-rate-select>
      <nve-media-fullscreen-button commandfor="form-example-controller"></nve-media-fullscreen-button>
    </div>
  </div>
  <pre></pre>
</form>
<script type="module">
  const form = document.querySelector('#controller-form');
  const pre = document.querySelector('#controller-form pre');
  form.addEventListener('input', () => {
    const values = Object.fromEntries(new FormData(form).entries());
    pre.innerText = JSON.stringify(values, null, 2);
  });
</script>
  `
};

/**
 * @summary Media controller composition inside a card. Use this when the media controller should be the primary content of a card.
 */
export const Card = {
  render: () => html`
    <nve-card style="width: 520px">
      <nve-media-controller id="card-controller">
        <video src="/static/video/particle.mp4" playsinline></video>
      </nve-media-controller>
      <nve-card-content>
        <div
          role="toolbar"
          aria-label="media controls"
          nve-layout="row full gap:xs align:vertical-center"
        >
          <nve-media-seek-button commandfor="card-controller" action="start"></nve-media-seek-button>
          <nve-media-seek-button commandfor="card-controller" action="backward" value="3"></nve-media-seek-button>
          <nve-media-pause-button commandfor="card-controller" name="paused" value="true" checked></nve-media-pause-button>
          <nve-media-seek-button commandfor="card-controller" action="forward" value="3"></nve-media-seek-button>
          <nve-media-seek-button commandfor="card-controller" action="end"></nve-media-seek-button>
          <nve-divider orientation="vertical"></nve-divider>
          <nve-media-time-range
            commandfor="card-controller"
            name="currentTime"
            nve-layout="full"
          ></nve-media-time-range>
          <nve-divider orientation="vertical"></nve-divider>
          <nve-media-mute-button commandfor="card-controller" name="muted" value="true"></nve-media-mute-button>
          <nve-media-volume-range
            commandfor="card-controller"
            name="volume"
            nve-layout="full"
          ></nve-media-volume-range>
          <nve-media-playback-rate-select commandfor="card-controller" name="playbackRate"></nve-media-playback-rate-select>
          <nve-media-fullscreen-button commandfor="card-controller"></nve-media-fullscreen-button>
        </div>
      </nve-card-content>
    </nve-card>
  `
};
