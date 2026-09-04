// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LabelOcclusionTracker } from './occlusion.js';

describe(LabelOcclusionTracker.name, () => {
  it('requires two consecutive zero and nonzero results before changing pointer gating', () => {
    const tracker = new LabelOcclusionTracker();
    tracker.setTextureMode(true);

    expect(tracker.needsSample).toBe(true);
    expect(tracker.recordOcclusionSamples(0)).toBe(false);
    tracker.setTextureMode(true);
    expect(tracker.needsSample).toBe(true);
    expect(tracker.pointerEnabled).toBe(true);
    expect(tracker.recordOcclusionSamples(0)).toBe(true);
    expect(tracker.needsSample).toBe(false);
    expect(tracker.pointerEnabled).toBe(false);
    expect(tracker.recordOcclusionSamples(1)).toBe(true);
    expect(tracker.needsSample).toBe(true);
    expect(tracker.recordOcclusionSamples(1)).toBe(false);
    expect(tracker.needsSample).toBe(false);
  });

  it('removes occlusion and pointer blocking in overlay mode', () => {
    const tracker = new LabelOcclusionTracker();
    tracker.setTextureMode(true);
    tracker.recordOcclusionSamples(0);
    tracker.recordOcclusionSamples(0);
    expect(tracker.occluded).toBe(true);
    tracker.setTextureMode(false);

    expect(tracker.occluded).toBe(false);
    expect(tracker.handlePointerEvent({ pointerId: 4, type: 'pointerdown', visibility: 'geometry-in-front' })).toBe(
      'allow'
    );
  });

  it('blocks the down, up, and click for a geometry-covered pixel, then clears the pointer', () => {
    const tracker = new LabelOcclusionTracker();
    tracker.setTextureMode(true);

    expect(tracker.handlePointerEvent({ pointerId: 7, type: 'pointerdown', visibility: 'geometry-in-front' })).toBe(
      'block'
    );
    expect(tracker.handlePointerEvent({ pointerId: 7, type: 'pointerup' })).toBe('block');
    expect(tracker.handlePointerEvent({ pointerId: 7, type: 'click' })).toBe('block');
    expect(tracker.handlePointerEvent({ pointerId: 7, type: 'click' })).toBe('allow');
  });

  it('favors label input for a visible or unavailable per-pixel readback and clears on cancel', () => {
    const tracker = new LabelOcclusionTracker();
    tracker.setTextureMode(true);

    expect(tracker.handlePointerEvent({ pointerId: 1, type: 'pointerdown', visibility: 'unavailable' })).toBe('allow');
    expect(tracker.handlePointerEvent({ pointerId: 2, type: 'pointerdown', visibility: 'label-visible' })).toBe(
      'allow'
    );
    tracker.handlePointerEvent({ pointerId: 3, type: 'pointerdown', visibility: 'geometry-in-front' });
    expect(tracker.handlePointerEvent({ pointerId: 3, type: 'pointercancel' })).toBe('allow');
    expect(tracker.handlePointerEvent({ pointerId: 3, type: 'click' })).toBe('allow');
  });
});
