// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneTriangles } from './triangles.js';
import './define.js';
describe(SceneTriangles.metadata.tag, () => {
  it('renders on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-triangles></nve-scene-triangles>`);
    expect(result).toContain('nve-scene-triangles');
    expect(result).toContain('shadowroot="open"');
  });
});
