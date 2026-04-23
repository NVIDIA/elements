// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { ExamplesService } from './examples.service.js';

describe('ExamplesService', () => {
  it('should return the examples json', async () => {
    const examples = await ExamplesService.getData();
    expect(examples).toBeDefined();
    expect(examples.length).toBeGreaterThan(0);
  });

  it('should search examples', async () => {
    const results = await ExamplesService.search('button');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });
});
