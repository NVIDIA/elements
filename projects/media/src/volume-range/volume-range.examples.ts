// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/VolumeRange',
  component: 'nve-media-volume-range'
};

/**
 * @summary Volume range connected to a media controller. Use the native media volume scale from 0 to 1 for form submission.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="volume-example" style="max-width: 300px">
      <video src="/static/video/particle.mp4" playsinline></video>
      <nve-media-volume-range commandfor="volume-example" name="volume"></nve-media-volume-range>
    </nve-media-controller>
  `
};
