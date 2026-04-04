// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { ApiService } from './api.service.js';

describe('ApiService', () => {
  it('should return the api json', async () => {
    const api = await ApiService.getData();
    expect(api).toBeDefined();
    expect(api.data.elements.length).toBeGreaterThan(0);
    expect(api.data.attributes.length).toBeGreaterThan(0);
    expect(api.data.tokens.length).toBeGreaterThan(0);
    expect(api.data.types.length).toBeGreaterThan(0);
    expect(api.created).toBeDefined();
  });

  it('should search api items', async () => {
    const results = await ApiService.search('button');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should ignore nve- prefix and match on meaningful name parts', async () => {
    const results = await ApiService.search('nve-badge');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    // First result should be badge-related, not an unrelated element
    const firstResult = results[0];
    expect(firstResult.name.toLowerCase()).toContain('badge');
  });

  it('should return same results for "badge" and "nve-badge"', async () => {
    const badgeResults = await ApiService.search('badge');
    const nveBadgeResults = await ApiService.search('nve-badge');

    // Both searches should return the same top results since "nve" is a stop word
    expect(badgeResults[0]?.name).toBe(nveBadgeResults[0]?.name);
  });
});
