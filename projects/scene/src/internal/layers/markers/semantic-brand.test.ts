// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { getSemanticMarkerKind, registerSemanticMarkerSource } from './semantic-brand.js';

describe('semantic marker branding', () => {
  it('uses object identity so copying visible properties cannot forge a source brand', () => {
    const source = { kind: 'cube' };
    registerSemanticMarkerSource(source, 'cube');
    expect(getSemanticMarkerKind(source)).toBe('cube');
    expect(getSemanticMarkerKind({ ...source })).toBeUndefined();
    expect(Object.keys(source)).toEqual(['kind']);
  });

  it('can update one source without changing another source of the same shape', () => {
    const left = Object.freeze({});
    const right = Object.freeze({});
    registerSemanticMarkerSource(left, 'arrow');
    registerSemanticMarkerSource(right, 'sphere');
    registerSemanticMarkerSource(left, 'cone');
    expect(getSemanticMarkerKind(left)).toBe('cone');
    expect(getSemanticMarkerKind(right)).toBe('sphere');
  });
});
