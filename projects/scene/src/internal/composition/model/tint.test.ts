// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { composeModelTint, setModelTint } from './tint.js';
import type { RGBA } from '../../color/types.js';

describe('model tint composition', () => {
  it('returns an independent color when models have no authored tint', () => {
    const body = document.createElement('div');
    const color: RGBA = [0.2, 0.4, 0.6, 0.8];
    const result = composeModelTint(body, color);
    expect(result).toEqual(color);
    expect(result).not.toBe(color);
  });

  it('composes nested tints and alpha without tinting siblings or changing the input', () => {
    const scene = document.createElement('nve-scene');
    const outer = document.createElement('nve-scene-model');
    const inner = document.createElement('nve-scene-model');
    const body = document.createElement('div');
    const sibling = document.createElement('div');
    scene.append(outer, sibling);
    outer.append(inner);
    inner.append(body);
    setModelTint(outer, '#ff000080');
    setModelTint(inner, '#0000ff80');
    const color: RGBA = [1, 1, 1, 0.5];
    const result = composeModelTint(body, color);
    expect(result.slice(0, 3)).toEqual([0, 0, 0]);
    expect(result[3]).toBeCloseTo(0.5 * (128 / 255) ** 2);
    expect(composeModelTint(sibling, color)).toEqual(color);
    expect(color).toEqual([1, 1, 1, 0.5]);
    setModelTint(inner, '#ffffff');
    composeModelTint(body, color).forEach((value, index) =>
      expect(value).toBeCloseTo([1, 0, 0, 0.5 * (128 / 255)][index]!)
    );
  });

  it('stops inherited tint at a nested scene boundary', () => {
    const outerScene = document.createElement('nve-scene');
    const model = document.createElement('nve-scene-model');
    const innerScene = document.createElement('nve-scene');
    const body = document.createElement('div');
    outerScene.append(model);
    model.append(innerScene);
    innerScene.append(body);
    setModelTint(model, '#000000');
    expect(composeModelTint(body, [1, 1, 1, 1])).toEqual([1, 1, 1, 1]);
  });
});
