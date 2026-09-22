// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createPositiveFiniteNumberConverter } from './converters.js';

describe('property converters', () => {
  it('should convert positive finite number attributes', () => {
    const converter = createPositiveFiniteNumberConverter(3);

    expect(converter.fromAttribute('0.5')).toBe(0.5);
    expect(converter.fromAttribute('2')).toBe(2);
  });

  it.each([null, '', '0', '-1', 'NaN', 'Infinity'])('should restore the fallback for %s', value => {
    expect(createPositiveFiniteNumberConverter(3).fromAttribute(value)).toBe(3);
  });
});
