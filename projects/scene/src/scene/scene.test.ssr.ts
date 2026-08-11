// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Scene } from '@nvidia-elements/scene/scene';
import '@nvidia-elements/scene/scene/define.js';

describe(Scene.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-scene></nve-scene>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-scene')).toBe(true);
  });
});
