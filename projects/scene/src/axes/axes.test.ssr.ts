// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneAxes } from './axes.js';
import './define.js';

describe(SceneAxes.metadata.tag, () => {
  it('renders on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-axes></nve-scene-axes>`);
    expect(result).toContain(SceneAxes.metadata.tag);
    expect(result).toContain('shadowroot="open"');
  });
});
