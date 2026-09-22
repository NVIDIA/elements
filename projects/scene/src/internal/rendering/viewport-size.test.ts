// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { getDevicePixelSize } from './viewport-size.js';

function entry(devicePixels: readonly ResizeObserverSize[]): ResizeObserverEntry {
  return {
    target: document.createElement('div'),
    contentRect: new DOMRect(0, 0, 10.25, 20),
    contentBoxSize: [],
    borderBoxSize: [],
    devicePixelContentBoxSize: devicePixels
  };
}
describe(getDevicePixelSize.name, () => {
  it('accepts rounded physical dimensions only when they agree with current DPR', () => {
    expect(getDevicePixelSize(entry([{ inlineSize: 21, blockSize: 40 }]), 2)).toEqual({ width: 21, height: 40 });
    expect(getDevicePixelSize(entry([{ inlineSize: 10, blockSize: 20 }]), 2)).toEqual({ width: 20.5, height: 40 });
    expect(getDevicePixelSize(entry([]), 2)).toEqual({ width: 20.5, height: 40 });
  });
});
