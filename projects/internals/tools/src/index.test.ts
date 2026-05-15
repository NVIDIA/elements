// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ManagedToolMethod } from './internal/tools.js';

const originalPlaygroundBaseUrl = process.env.ELEMENTS_PLAYGROUND_BASE_URL;

async function getTools(): Promise<ManagedToolMethod<unknown>[]> {
  vi.resetModules();
  const { tools } = await import('./index.js');
  return tools;
}

async function getToolNames(): Promise<string[]> {
  return (await getTools()).map(tool => tool.metadata.toolName);
}

describe('tools', () => {
  afterEach(() => {
    if (originalPlaygroundBaseUrl === undefined) {
      delete process.env.ELEMENTS_PLAYGROUND_BASE_URL;
    } else {
      process.env.ELEMENTS_PLAYGROUND_BASE_URL = originalPlaygroundBaseUrl;
    }
    vi.resetModules();
  });

  it('should be defined', async () => {
    await expect(getToolNames()).resolves.toBeDefined();
  });

  it('should omit playground tools without runtime playground url configuration', async () => {
    delete process.env.ELEMENTS_PLAYGROUND_BASE_URL;
    await expect(getToolNames()).resolves.not.toContain('playground_create');
  });

  it('should include playground tools with runtime playground url configuration', async () => {
    process.env.ELEMENTS_PLAYGROUND_BASE_URL = 'https://playground.example.com';
    await expect(getToolNames()).resolves.toContain('playground_create');
  });

  it('should include skills tools', async () => {
    const tools = await getTools();

    expect(tools.some(tool => tool.metadata.command === 'skills.list')).toBe(true);
    expect(tools.some(tool => tool.metadata.command === 'skills.get')).toBe(true);
  });
});
