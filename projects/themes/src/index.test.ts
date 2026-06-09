// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

async function readThemeCss(theme: string) {
  return readFile(new URL(`../dist/${theme}.css`, import.meta.url), 'utf8');
}

describe('@nvidia-elements/themes', () => {
  it('should generate compact theme scale overrides', async () => {
    const css = await readThemeCss('compact');

    expect(css).toContain('[nve-theme~=compact]');
    expect(css).toContain('--nve-ref-scale-size:0.95');
    expect(css).toContain('--nve-ref-scale-space:0.8');
  });

  it('should generate high contrast system color overrides', async () => {
    const css = await readThemeCss('high-contrast');

    expect(css).toContain('[nve-theme~=high-contrast]');
    expect(css).toContain('--nve-sys-text-color:CanvasText');
    expect(css).toContain('--nve-sys-layer-canvas-background:Canvas');
    expect(css).toContain('--nve-ref-border-color:CanvasText');
  });

  it('should generate reduced motion duration overrides', async () => {
    const css = await readThemeCss('reduced-motion');

    expect(css).toContain('[nve-theme~=reduced-motion]');
    expect(css).toContain('--nve-ref-animation-duration-100:0');
    expect(css).toContain('--nve-ref-animation-duration-400:1000ms');
  });

  it('should generate debug theme outline tokens', async () => {
    const css = await readThemeCss('debug');

    expect(css).toContain('[nve-theme~=debug]');
    expect(css).toContain('--nve-debug-layout-outline:var(--nve-debug-outline-width) solid');
    expect(css).toContain('--nve-debug-outline-width:var(--nve-ref-size-50)');
  });
});
