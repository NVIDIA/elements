// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { createLabelItem, createLineItem, createMarkerItem, createMeshItem } from '../../../test/rendering.js';
import {
  getPickItemCount,
  hasPickTargets,
  isCubeMarkerRenderItem,
  isInteractiveItem,
  isLabelRenderItem,
  isMeshRenderItem,
  isOpaqueItem,
  isTransparentItem,
  markerOutlinePassIsVisible
} from './render-items.js';

describe('render item classification', () => {
  it('counts logical targets for each connected line topology and mesh placement mode', () => {
    expect(getPickItemCount(createLineItem(4, 'strip'))).toBe(3);
    expect(getPickItemCount(createLineItem(4, 'loop'))).toBe(4);
    expect(getPickItemCount(createLineItem(4, 'segments'))).toBe(2);
    const mesh = createMeshItem();
    expect(getPickItemCount(mesh)).toBe(1);
    expect(getPickItemCount({ ...mesh, data: { ...mesh.data, identityInstance: false } })).toBe(0);
    expect(hasPickTargets([createMarkerItem(0)])).toBe(false);
    expect(hasPickTargets([mesh])).toBe(true);
  });

  it('honors interaction and outline transparency independently of the main marker surface', () => {
    const marker = createMarkerItem();
    expect(isCubeMarkerRenderItem(marker)).toBe(true);
    const outline = { ...marker, data: { ...marker.data, outlineTransparent: true, outlineOpaque: false } };
    expect(isTransparentItem(outline)).toBe(true);
    expect(markerOutlinePassIsVisible(outline, true)).toBe(true);
    expect(markerOutlinePassIsVisible(outline, false)).toBe(false);
    expect(isInteractiveItem({ ...marker, interactive: false })).toBe(false);
    const label = createLabelItem();
    expect(isLabelRenderItem(label)).toBe(true);
    const mesh = createMeshItem();
    expect(isMeshRenderItem(mesh)).toBe(true);
    expect(isOpaqueItem(mesh)).toBe(true);
  });
});
