// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/FullscreenButton',
  component: 'nve-media-fullscreen-button'
};

/**
 * @summary Full-screen button connected to a media controller. Use this command-only control when playback should expand the controller region.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="fullscreen-example">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-fullscreen-button commandfor="fullscreen-example"></nve-media-fullscreen-button>
    </nve-media-controller>
  `
};
