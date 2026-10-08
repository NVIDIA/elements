// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/LoopButton',
  component: 'nve-media-loop-button'
};

/**
 * @summary Loop button connected to a video controller. Use with playback controls to repeat a recording continuously until the user disables looping.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="loop-example" style="max-width: 300px">
      <video src="/static/video/particle.mp4" playsinline></video>
      <div nve-layout="row gap:xs">
        <nve-media-pause-button commandfor="loop-example"></nve-media-pause-button>
        <nve-media-loop-button commandfor="loop-example"></nve-media-loop-button>
      </div>
    </nve-media-controller>
  `
};

/**
 * @summary Video with looping enabled in native markup. Use when a recording should repeat from the first playback and the loop button should show its current state.
 */
export const InitiallyLooping = {
  render: () => html`
    <nve-media-controller id="initial-loop-example" style="max-width: 300px">
      <video src="/static/video/particle.mp4" playsinline loop></video>
      <div nve-layout="row gap:xs">
        <nve-media-pause-button commandfor="initial-loop-example"></nve-media-pause-button>
        <nve-media-loop-button commandfor="initial-loop-example"></nve-media-loop-button>
      </div>
    </nve-media-controller>
  `
};
