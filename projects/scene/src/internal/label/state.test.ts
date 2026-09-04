// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  consumeLabelDirty,
  getLabelConfiguration,
  getLabelStateSnapshot,
  invalidateLabel,
  registerLabelState,
  touchLabelState
} from './state.js';

describe('scene label state', () => {
  it('should parse every supported anchor and fall back deterministically', () => {
    const label = document.createElement('nve-scene-label');
    registerLabelState(label);
    const anchors = [
      'top-left',
      'top',
      'top-right',
      'left',
      'center',
      'right',
      'bottom-left',
      'bottom',
      'bottom-right'
    ];

    for (const anchor of anchors) {
      label.setAttribute('anchor', anchor);
      expect(getLabelConfiguration(label).anchor).toBe(anchor);
    }
    label.setAttribute('anchor', 'diagonal');
    label.setAttribute('frame', '  base-link  ');
    Reflect.set(label, 'offset', [5, -3]);
    Reflect.set(label, 'position', [1, 2, 3]);
    expect(getLabelConfiguration(label)).toEqual({
      anchor: 'center',
      frame: 'base-link',
      offset: [5, -3],
      position: [1, 2, 3]
    });
  });

  it('should track dirty state, versions, and the default Scene strategy', () => {
    const label = document.createElement('nve-scene-label');
    registerLabelState(label);
    expect(consumeLabelDirty(label)).toBe(true);
    expect(consumeLabelDirty(label)).toBe(false);

    touchLabelState(label);
    invalidateLabel(label);
    expect(getLabelStateSnapshot(label)).toEqual({ dirty: true, version: 2 });
  });

  it('rejects state operations for an unregistered label', () => {
    const label = document.createElement('div');

    expect(() => consumeLabelDirty(label)).toThrow('Element is not a registered scene label.');
  });
});
