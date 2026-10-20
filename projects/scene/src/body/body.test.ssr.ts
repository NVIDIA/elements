// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneBody } from './body.js';
import './define.js';
import '../mesh/define.js';

describe(SceneBody.metadata.tag, () => {
  it('renders nested scene shapes on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene-body frame="arm">
        <nve-scene-shape type="cone" position="[1,2,3]"></nve-scene-shape>
      </nve-scene-body>
    `);

    expect(result).toContain(SceneBody.metadata.tag);
    expect(result).toContain('frame="arm"');
    expect(result).toContain('nve-scene-shape');
    expect(result).toContain('type="cone"');
    expect(result).toContain('position="[1,2,3]"');
    expect(result.match(/shadowroot="open"/g)).toHaveLength(2);
  });

  it('preserves mesh file, part transform, and tint declarations for browser hydration', async () => {
    const result = await ssrRunner.render(
      html`<nve-scene-body tint="#39404e" aria-label="Robot arm"
        ><nve-scene-mesh src="/bodies/arm.stl" position="[0,0,1]" color="#ff7a33"></nve-scene-mesh
      ></nve-scene-body>`
    );
    expect(result).toContain('src="/bodies/arm.stl"');
    expect(result).toContain('position="[0,0,1]"');
    expect(result).toContain('tint="#39404e"');
    expect(result).toContain('aria-label="Robot arm"');
    expect(result).toContain('shadowroot="open"');
  });
});
