// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ScenePyramids } from './pyramids.js';
import './define.js';

describe(ScenePyramids.metadata.tag, () => {
  it('should render scene data on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-pyramids></nve-scene-pyramids>`);
    expect(result.includes('nve-scene-pyramids')).toBe(true);
    expect(result.includes('shadowroot="open"')).toBe(true);
  });
});
