// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ScenePoints } from './points.js';
import './define.js';

describe(ScenePoints.metadata.tag, () => {
  it('renders a point layer on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-points size="4"></nve-scene-points>`);
    expect(result).toContain('nve-scene-points');
    expect(result).toContain('shadowroot="open"');
  });
});
