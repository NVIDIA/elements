// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { isAllowedNveHostTailwindToken, isTailwindToken, stripVariantsAndModifiers } from './tailwind.js';

describe('stripVariantsAndModifiers', () => {
  it('should return an empty string when the token is only modifiers', () => {
    expect(stripVariantsAndModifiers('!')).toBe('');
    expect(stripVariantsAndModifiers('-')).toBe('');
    expect(stripVariantsAndModifiers('hover:')).toBe('');
  });
});

describe('isTailwindToken', () => {
  it('should reject empty tokens', () => {
    expect(isTailwindToken('')).toBe(false);
  });

  it('should detect bracketed arbitrary CSS properties', () => {
    expect(isTailwindToken('[color:red]')).toBe(true);
    expect(isTailwindToken('[margin:0]')).toBe(true);
    expect(isTailwindToken('[--gap:1rem]')).toBe(true);
  });

  it('should reject malformed bracketed arbitrary properties', () => {
    expect(isTailwindToken('[color:]')).toBe(false);
    expect(isTailwindToken('[:red]')).toBe(false);
    expect(isTailwindToken('[nocolon]')).toBe(false);
    expect(isTailwindToken('[123:red]')).toBe(false);
    expect(isTailwindToken('[]')).toBe(false);
  });

  it('should reject unknown prefixes with arbitrary values', () => {
    expect(isTailwindToken('foo-[123px]')).toBe(false);
  });
});

describe('isAllowedNveHostTailwindToken', () => {
  it('should reject empty tokens', () => {
    expect(isAllowedNveHostTailwindToken('')).toBe(false);
  });
});
