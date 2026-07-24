// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/PauseButton',
  component: 'nve-media-pause-button'
};

/**
 * @summary Pause button inside a media controller. Use commandfor to associate controls with the controller.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="pause-example">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-pause-button commandfor="pause-example" name="paused" value="true" checked></nve-media-pause-button>
    </nve-media-controller>
  `
};
