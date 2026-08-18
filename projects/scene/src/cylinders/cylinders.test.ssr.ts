// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneCylinders } from './cylinders.js';
import './define.js';

describe(SceneCylinders.metadata.tag, () => {
  it('should render scene data on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-cylinders></nve-scene-cylinders>`);
    expect(result.includes('nve-scene-cylinders')).toBe(true);
    expect(result.includes('shadowroot="open"')).toBe(true);
  });
});
