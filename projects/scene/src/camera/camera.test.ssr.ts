// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SceneCamera } from './camera.js';
import './define.js';

describe(SceneCamera.metadata.tag, () => {
  it('renders every behavior on the server', async () => {
    const result = await ssrRunner.render(html`
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera>
      <nve-scene-camera behavior="top"></nve-scene-camera>
    `);
    expect(result).toContain(SceneCamera.metadata.tag);
    expect(result).toContain('shadowroot="open"');
  });
});
