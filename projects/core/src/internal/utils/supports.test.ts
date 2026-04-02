// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { supportsCSSLegacyInsetArea, supportsCSSPositionArea, supportsNativeCSSAnchorPosition } from './supports.js';

describe('supportsNativeCSSAnchorPosition', () => {
  it('should determine if CSS Anchor Positioning is supported ', async () => {
    expect(supportsNativeCSSAnchorPosition()).toBe(true);
  });
});

describe('supportsCSSPositionArea', () => {
  it('should determine if CSS Position Area is supported ', async () => {
    expect(supportsCSSPositionArea()).toBe(true);
  });
});

describe('supportsCSSLegacyInsetArea', () => {
  it('should determine if CSS Legacy Inset Area Positioning is supported ', async () => {
    expect(supportsCSSLegacyInsetArea()).toBe(false);
  });
});
