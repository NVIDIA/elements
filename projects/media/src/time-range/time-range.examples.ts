// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/TimeRange',
  component: 'nve-media-time-range'
};

/**
 * @summary Time range connected to a media controller. Use this control for finite recorded media that supports scrubbing.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="time-example">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-time-range commandfor="time-example" name="currentTime"></nve-media-time-range>
    </nve-media-controller>
  `
};
