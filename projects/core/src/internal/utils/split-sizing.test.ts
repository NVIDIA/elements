// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { fitSizes, resizeSizes } from './split-sizing.js';

describe('split sizing', () => {
  it('retains preferences across constrained container sizes', () => {
    const weights = [1, 2, 1];
    expect(fitSizes(weights, [120, 120, 120], 400)).toEqual([120, 160, 120]);
    expect(fitSizes(weights, [120, 120, 120], 800)).toEqual([200, 400, 200]);
    expect(weights).toEqual([1, 2, 1]);
  });

  it('overflows instead of violating minimum sizes', () => {
    expect(fitSizes([1, 1, 1], [200, 200, 200], 300)).toEqual([200, 200, 200]);
  });

  it('exchanges adjacent space without disturbing a third group', () => {
    expect(resizeSizes([300, 300, 300], [120, 120, 120], { boundary: 0, delta: 100, policy: 'stop' })).toEqual([
      400, 200, 300
    ]);
  });

  it('compares stopping and propagation at constraints', () => {
    expect(resizeSizes([300, 300, 300], [120, 250, 120], { boundary: 0, delta: 100, policy: 'stop' })).toEqual([
      350, 250, 300
    ]);
    expect(resizeSizes([300, 300, 300], [120, 250, 120], { boundary: 0, delta: 100, policy: 'propagate' })).toEqual([
      400, 250, 250
    ]);
  });
});
