// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ScenePolygon } from './polygon.js';
import './define.js';

describe(ScenePolygon.metadata.tag, () => {
  it('should render polygon geometry and marker slots on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene-polygon geometry='{"outer":[[0,0],[2,0],[2,2],[0,2]]}'></nve-scene-polygon>
    `);
    expect(result.includes('nve-scene-polygon')).toBe(true);
    expect(result.includes('shadowroot="open"')).toBe(true);
  });
});
