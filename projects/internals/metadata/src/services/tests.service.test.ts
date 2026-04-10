// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { TestsService } from './tests.service.js';

describe('TestsService', () => {
  it('should be defined', () => {
    expect(TestsService.getData).toBeDefined();
  });
});
