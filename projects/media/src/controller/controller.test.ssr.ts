// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { MediaController } from './controller.js';
import './define.js';

describe(MediaController.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-media-controller>
        <video></video>
        <span></span>
      </nve-media-controller>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes(MediaController.metadata.tag)).toBe(true);
  });
});
