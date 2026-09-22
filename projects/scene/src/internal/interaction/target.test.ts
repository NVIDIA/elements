// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { isInteractiveLayer } from './target.js';

describe(isInteractiveLayer.name, () => {
  it('requires the boolean capability rather than a truthy property or HTML attribute', () => {
    const layer = document.createElement('div');
    layer.setAttribute('interactive', '');
    expect(isInteractiveLayer(layer)).toBe(false);
    for (const value of [false, 'true', 1, undefined]) {
      Reflect.set(layer, 'interactive', value);
      expect(isInteractiveLayer(layer)).toBe(false);
    }
    Reflect.set(layer, 'interactive', true);
    expect(isInteractiveLayer(layer)).toBe(true);
  });
});
