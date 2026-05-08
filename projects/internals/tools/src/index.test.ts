// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { tools } from './index.js';

describe('tools', () => {
  it('should be defined', () => {
    expect(tools).toBeDefined();
  });

  it('should include skills tools', () => {
    expect(tools.some(tool => tool.metadata.command === 'skills.list')).toBe(true);
    expect(tools.some(tool => tool.metadata.command === 'skills.get')).toBe(true);
  });
});
