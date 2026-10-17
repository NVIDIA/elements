// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { sameHeaderConfiguration } from './header-configuration.utils.js';

import type { WorkspaceHeaderConfiguration } from './header-configuration.utils.js';

const configuration: WorkspaceHeaderConfiguration = {
  selected: true,
  offset: 20,
  animate: false,
  tabWidth: 120,
  headerHeight: 40,
  suffixEnd: 8,
  clipLeft: 10,
  clipWidth: 100
};

describe('workspace header configuration equality', () => {
  it('accepts independently created configurations with equal values', () => {
    expect(sameHeaderConfiguration(configuration, { ...configuration })).toBe(true);
  });

  it.each([
    { field: 'selected', change: { selected: false } },
    { field: 'offset', change: { offset: 30 } },
    { field: 'animate', change: { animate: true } },
    { field: 'tabWidth', change: { tabWidth: 140 } },
    { field: 'headerHeight', change: { headerHeight: 48 } },
    { field: 'suffixEnd', change: { suffixEnd: 12 } },
    { field: 'clipLeft', change: { clipLeft: 15 } },
    { field: 'clipWidth', change: { clipWidth: 80 } }
  ])('detects a changed $field', ({ change }) => {
    expect(sameHeaderConfiguration(configuration, { ...configuration, ...change })).toBe(false);
  });
});
