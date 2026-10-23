// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneGridlines } from './gridlines.js';
import './define.js';

describe(SceneGridlines.metadata.tag, () => {
  it('renders on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-gridlines></nve-scene-gridlines>`);
    expect(result).toContain(SceneGridlines.metadata.tag);
    expect(result).toContain('shadowroot="open"');
  });

  it('renders checkerboard styles on the server without sampling browser colors', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene-gridlines pattern="checkerboard" spacing="0.5" count="4" style="--color: var(--nve-ref-border-color-muted); --alternate-color: var(--nve-sys-layer-canvas-background)"></nve-scene-gridlines>
    `);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('pattern="checkerboard"');
    expect(result).toContain('--color: var(--nve-ref-border-color-muted)');
    expect(result).toContain('--alternate-color: var(--nve-sys-layer-canvas-background)');
  });
});
