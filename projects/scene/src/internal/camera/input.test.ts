// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { CameraInputTracking } from './input.js';

describe(CameraInputTracking.name, () => {
  it('tracks author assignments and attribute removal without treating defaults as authored', () => {
    const tracking = new CameraInputTracking<'distance'>();

    expect(tracking.recordAssignment('distance')).toBe(false);
    expect(tracking.isExplicit('distance')).toBe(false);

    tracking.start();
    expect(tracking.recordAssignment('distance')).toBe(true);
    expect(tracking.isExplicit('distance')).toBe(true);
    expect(tracking.recordAssignment('distance')).toBe(false);

    tracking.applyAttribute('distance', false, () => undefined);
    expect(tracking.isExplicit('distance')).toBe(false);
  });

  it('restores nested assignment origins', () => {
    const tracking = new CameraInputTracking<'distance'>();
    tracking.start();

    tracking.applyAttribute('distance', true, () => {
      tracking.applyRuntimeWrite(() => {
        expect(tracking.recordAssignment('distance')).toBe(false);
      });
      expect(tracking.recordAssignment('distance')).toBe(false);
    });

    expect(tracking.isExplicit('distance')).toBe(true);
    tracking.applyRuntimeWrite(() => {
      expect(tracking.recordAssignment('distance')).toBe(false);
    });
    tracking.applyAttribute('distance', false, () => undefined);
    expect(tracking.recordAssignment('distance')).toBe(true);
  });
});
