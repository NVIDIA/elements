// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { isResizeKey } from './resize-input.utils.js';

describe('workspace resize keys', () => {
  it.each(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])(
    'recognizes %s as resize input',
    key => {
      expect(isResizeKey(key)).toBe(true);
    }
  );

  it.each(['Escape', 'Tab', 'Enter', ' ', 'a'])('leaves %s to other interactions', key => {
    expect(isResizeKey(key)).toBe(false);
  });
});
