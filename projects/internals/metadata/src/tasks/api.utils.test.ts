// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getApi } from './api.utils.js';

describe('ApiUtils', () => {
  // todo: mock file dependencies
  it('should return the api json', async () => {
    expect(getApi).toBeDefined();
  });
});
