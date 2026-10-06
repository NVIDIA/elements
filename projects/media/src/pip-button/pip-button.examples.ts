// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/PipButton',
  component: 'nve-media-pip-button'
};

/**
 * @summary Picture-in-picture button connected to a video controller. Use this control to keep a video visible while working in another window.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="pip-example" style="max-width: 300px">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-pip-button commandfor="pip-example"></nve-media-pip-button>
    </nve-media-controller>
  `
};
