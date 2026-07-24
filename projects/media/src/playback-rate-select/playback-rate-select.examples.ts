// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/PlaybackRateSelect',
  component: 'nve-media-playback-rate-select'
};

/**
 * @summary Playback rate select connected to a media controller. Use when playback speed should submit as form data and send media commands.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="playback-rate-example">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-pause-button commandfor="playback-rate-example" checked></nve-media-pause-button>
      <nve-media-playback-rate-select
        commandfor="playback-rate-example"
        name="playbackRate"
        value="1"
        rates="[0.5, 1, 1.5, 2]"
      ></nve-media-playback-rate-select>
    </nve-media-controller>
  `
};

/**
 * @summary Disabled playback rate select. Use when playback speed should not be editable.
 * @tags test-case
 */
export const Disabled = {
  render: () => html`
    <nve-media-playback-rate-select aria-label="disabled playback rate" disabled></nve-media-playback-rate-select>
  `
};
