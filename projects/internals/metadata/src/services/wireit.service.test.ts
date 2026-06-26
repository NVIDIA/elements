// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { WireitService } from './wireit.service.js';

describe('WireitService', () => {
  it('should return the wireit graph data', async () => {
    const graph = await WireitService.getData();

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.links.length).toBeGreaterThan(0);
    expect(await WireitService.getData()).toBe(graph);
  });
});
