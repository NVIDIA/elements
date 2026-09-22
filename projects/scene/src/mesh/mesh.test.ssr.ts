// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { html } from 'lit';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/scene/mesh/define.js';
describe('scene mesh ssr', () => {
  it('renders', async () => {
    const result = await ssrRunner.render(html`<nve-scene-mesh></nve-scene-mesh>`);
    expect(result).toContain('nve-scene-mesh');
    expect(result).toContain('shadowroot="open"');
  });
});
