// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { AdoptionService } from './adoption.service.js';

describe('AdoptionService', () => {
  it('should return the adoption data', async () => {
    const adoption = await AdoptionService.getData();

    expect(adoption.created).toBeDefined();
    expect(adoption.packages.length).toBeGreaterThan(0);
    expect(adoption.totals.packages).toBe(adoption.packages.length);
    expect(adoption.github.repository).toBe('NVIDIA/elements');
    expect(await AdoptionService.getData()).toEqual(adoption);

    adoption.github.repository = 'modified';
    expect((await AdoptionService.getData()).github.repository).toBe('NVIDIA/elements');
  });
});
