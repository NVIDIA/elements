// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneHeightfield } from './heightfield.js';
import './define.js';

describe(SceneHeightfield.metadata.tag, () => {
  it('renders on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-heightfield></nve-scene-heightfield>`);
    expect(result).toContain(SceneHeightfield.metadata.tag);
    expect(result).toContain('shadowroot="open"');
  });
});
