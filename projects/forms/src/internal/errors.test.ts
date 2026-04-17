// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { FormControlError } from './errors.js';

describe('FormControlError', () => {
  it('should create an error with the correct message', () => {
    const error = new FormControlError('ui-element', 'test message');
    expect(error.message).toBe('(ui-element): test message');
  });
});
