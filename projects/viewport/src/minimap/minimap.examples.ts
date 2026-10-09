// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/minimap/define.js';
import '@nvidia-elements/viewport/gridlines/define.js';

export default {
  title: 'Elements/Viewport/Minimap',
  component: 'nve-viewport-minimap'
};

/**
 * @summary Provide custom minimap content to replace the default bounding boxes with a simplified representation of the viewport content.
 */
export const Default = {
  render: () => html`
    <nve-viewport autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px">
      <nve-viewport-gridlines></nve-viewport-gridlines>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>

      <nve-viewport-minimap>
        <svg slot="preview" width="900" height="600" viewBox="0 0 900 600" style="position: absolute; left: 0; top: 0">
          <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
          <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
          <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        </svg>
      </nve-viewport-minimap>
    </nve-viewport>
  `
};
