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
    <nve-media-controller id="time-example" style="max-width: 300px">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-time-range commandfor="time-example" name="currentTime"></nve-media-time-range>
    </nve-media-controller>
  `
};

/**
 * @summary When connected to a media controller, the time range renders each span from `mediaState.buffered` behind the played progress. The spans use media time in seconds and can contain gaps. Controller state takes precedence over `buffered-ranges` while the time range has a valid command target.
 * @tags test-case
 */
export const BufferedRanges = {
  render: () => html`
    <nve-media-time-range
      min="0"
      max="60"
      value="16"
      buffered-ranges='[{"start":0,"end":22},{"start":31,"end":48}]'
    ></nve-media-time-range>
  `
};
