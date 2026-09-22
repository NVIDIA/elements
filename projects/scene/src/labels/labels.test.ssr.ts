// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneLabels } from './labels.js';
import './define.js';

describe(SceneLabels.metadata.tag, () => {
  it('renders a label layer on the server', async () => {
    const result = await ssrRunner.render(html`<nve-scene-labels scale-unit="world"></nve-scene-labels>`);
    expect(result).toContain('nve-scene-labels');
    expect(result).toContain('shadowroot="open"');
  });
});
