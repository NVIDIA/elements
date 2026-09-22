// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { resolveSceneFeatureId, takeSceneFeatureIdSnapshot } from './feature-ids.js';
import { PointBuffer } from './points/buffer.js';
import { publishPackedSourceGeneration, resolvePackedSourcePublication } from './packed-source-publication.js';

describe('packed source publication', () => {
  it('separates identity-only generations from geometry changes', () => {
    const points = new PointBuffer({ capacity: 1 });
    const point = points.add({ featureId: 1842 });
    const sourceVersion = publishPackedSourceGeneration(points);

    point.featureId = 2710;
    const identity = resolvePackedSourcePublication({
      currentActiveCount: 1,
      currentSourceVersion: sourceVersion,
      requested: undefined,
      source: points,
      unavailableStateMessage: 'Source state is unavailable.'
    });

    expect(identity).toMatchObject({ geometryChanged: false, sourceVersion, visualChanged: false });
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(points, 1), 0)).toBe(1842);
    expect(publishPackedSourceGeneration(points, identity.sourceVersion)).toBe(sourceVersion);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(points, 1), 0)).toBe(2710);

    point.position.x = 1;
    const geometry = resolvePackedSourcePublication({
      currentActiveCount: 1,
      currentSourceVersion: sourceVersion,
      requested: undefined,
      source: points,
      unavailableStateMessage: 'Source state is unavailable.'
    });
    expect(geometry).toMatchObject({ geometryChanged: true, visualChanged: true });
  });

  it('classifies active-count and explicit empty-range publications', () => {
    const points = new PointBuffer({ capacity: 1 });
    points.add();
    const sourceVersion = publishPackedSourceGeneration(points);

    expect(
      resolvePackedSourcePublication({
        currentActiveCount: 0,
        currentSourceVersion: sourceVersion,
        requested: undefined,
        source: points,
        unavailableStateMessage: 'Source state is unavailable.'
      })
    ).toMatchObject({ geometryChanged: false, visualChanged: true });
    expect(
      resolvePackedSourcePublication({
        currentActiveCount: 1,
        currentSourceVersion: sourceVersion,
        requested: { count: 0, start: 1 },
        source: points,
        unavailableStateMessage: 'Source state is unavailable.'
      })
    ).toMatchObject({ geometryChanged: true, visualChanged: false });
    expect(publishPackedSourceGeneration(null)).toBe(-1);
  });
});
