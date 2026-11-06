// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { formatStandardNumber, parseVersion } from '@nvidia-elements/core/internal';

describe('parseVersion', () => {
  it('it should parse a version string', () => {
    expect(parseVersion('1.2.3')).toStrictEqual({ major: 1, minor: 2, patch: 3 });
  });

  it('it should parse a invalid version string', () => {
    expect(parseVersion('BROKEN_VERSION')).toStrictEqual({ major: -1, minor: -1, patch: -1 });
  });

  it('it should parse a version string with zero components', () => {
    expect(parseVersion('0.1.0')).toStrictEqual({ major: 0, minor: 1, patch: 0 });
  });
});

describe('formatStandardNumber', () => {
  it('it should format number to standard locale', () => {
    expect(formatStandardNumber(1000000)).toBe('1,000,000');
  });
});
