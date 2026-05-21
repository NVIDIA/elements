// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { supportsCSSLegacyInsetArea, supportsCSSPositionArea, supportsNativeCSSAnchorPosition } from './supports.js';

describe('supportsNativeCSSAnchorPosition', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return true when position-area is supported', () => {
    vi.stubGlobal('CSS', {
      supports: vi.fn((property: string, value: string) => property === 'position-area' && value === 'top')
    });

    expect(supportsNativeCSSAnchorPosition()).toBe(true);
  });

  it('should return true when legacy inset-area is supported', () => {
    vi.stubGlobal('CSS', {
      supports: vi.fn((property: string, value: string) => property === 'inset-area' && value === 'top')
    });

    expect(supportsNativeCSSAnchorPosition()).toBe(true);
  });

  it('should return undefined when CSS.supports is missing', () => {
    vi.stubGlobal('CSS', {});

    expect(supportsNativeCSSAnchorPosition()).toBeUndefined();
  });
});

describe('supportsCSSPositionArea', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should determine if CSS Position Area is supported', () => {
    vi.stubGlobal('CSS', {
      supports: vi.fn((property: string, value: string) => property === 'position-area' && value === 'top')
    });

    expect(supportsCSSPositionArea()).toBe(true);
  });
});

describe('supportsCSSLegacyInsetArea', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should determine if CSS Legacy Inset Area Positioning is supported', () => {
    vi.stubGlobal('CSS', {
      supports: vi.fn(() => false)
    });

    expect(supportsCSSLegacyInsetArea()).toBe(false);
  });
});
