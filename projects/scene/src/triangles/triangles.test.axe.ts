// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneTriangles } from './triangles.js';
import './define.js';
describe(SceneTriangles.metadata.tag, () => {
  it('passes the accessibility baseline', async () => {
    const fixture = await createFixture(html`<nve-scene-triangles></nve-scene-triangles>`);
    await elementIsStable(fixture.querySelector(SceneTriangles.metadata.tag));
    expect((await runAxe([SceneTriangles.metadata.tag])).violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
