// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { VERSION } from './index.js';

describe('@nvidia-elements/media', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
