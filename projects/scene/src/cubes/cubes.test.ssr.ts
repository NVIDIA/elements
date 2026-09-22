// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneCubes } from './cubes.js';
import './define.js';

describe(SceneCubes.metadata.tag, () => {
  it('should render scene data on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-cubes></nve-scene-cubes>`);
    expect(result.includes('nve-scene-cubes')).toBe(true);
    expect(result.includes('shadowroot="open"')).toBe(true);
  });
});
