// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import * as codes from './errors.js';

describe('scene diagnostic codes', () => {
  it('provides distinct stable identifiers suitable for event consumers', () => {
    const values = Object.values(codes);
    expect(values.length).toBeGreaterThan(0);
    expect(new Set(values).size).toBe(values.length);
    for (const code of values) expect(code).toMatch(/^[a-z]+(?:-[a-z]+)+$/);
  });
});
