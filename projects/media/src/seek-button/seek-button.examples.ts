// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

export default {
  title: 'Media/SeekButton',
  component: 'nve-media-seek-button'
};

/**
 * @summary Seek buttons for common transport actions. Use separate buttons for predictable start, backward, forward, and end commands.
 */
export const Default = {
  render: () => html`
    <nve-media-controller id="seek-example">
      <video src="/static/video/particle.mp4" playsinline></video>
      <div
        role="toolbar"
        aria-label="seek controls"
        nve-layout="row gap:xs"
      >
        <nve-media-seek-button commandfor="seek-example" action="start"></nve-media-seek-button>
        <nve-media-seek-button commandfor="seek-example" action="backward" value="10"></nve-media-seek-button>
        <nve-media-seek-button commandfor="seek-example" action="forward" value="10"></nve-media-seek-button>
        <nve-media-seek-button commandfor="seek-example" action="end"></nve-media-seek-button>
      </div>
    </nve-media-controller>
  `
};
