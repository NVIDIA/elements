// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneMarker } from './marker.js';
import './define.js';

describe(SceneMarker.metadata.tag, () => {
  it('should render declarative marker data on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-marker position="[1,2,3]"></nve-scene-marker>`);
    expect(result.includes('nve-scene-marker')).toBe(true);
    expect(result.includes('shadowroot="open"')).toBe(true);
  });
});
