// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneLabel } from './label.js';
import './define.js';

describe(SceneLabel.metadata.tag, () => {
  it('should render semantic label content on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene-label anchor="bottom" offset="[0,-12]" position="[1,2,3]"><span>Robot base</span></nve-scene-label>
    `);

    expect(result).toContain(SceneLabel.metadata.tag);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('<span>Robot base</span>');
  });
});
