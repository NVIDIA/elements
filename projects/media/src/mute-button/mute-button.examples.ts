// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/MuteButton',
  component: 'nve-media-mute-button'
};

/**
 * @summary Mute button connected to a media controller. Use this pattern to submit muted state with other form values.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="mute-example">
      <video src="/static/video/particle.mp4" playsinline muted></video>
      <nve-media-mute-button commandfor="mute-example" name="muted" value="true"></nve-media-mute-button>
    </nve-media-controller>
  `
};
