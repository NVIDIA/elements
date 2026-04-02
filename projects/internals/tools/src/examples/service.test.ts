// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Example } from '@internals/metadata';
import { ExamplesService } from './service.js';
import { getPublicExamples } from './utils.js';
import type { ToolMethod } from '../internal/tools.js';

describe('ExampleService', () => {
  it('should provide list tool', async () => {
    const result = await ExamplesService.list();
    expect(result).toBeDefined();
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get a summary list of available Elements (nve-*) component/pattern usage examples and code snippets. Use this to browse all available examples.'
    );
  });

  it('should provide search tool', async () => {
    const result = await ExamplesService.search({ query: 'button', format: 'markdown' });
    expect(result).toBeDefined();
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search Elements (nve-*) pattern usage examples by name, element type, or keywords. Returns up to 5 matching examples with full template code. Hint: use the list tool to get a list of all available examples and patterns first if unsure of what to search.'
    );
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });

  it('should provide get tool', async () => {
    const examples = getPublicExamples('json', await ExamplesService.getAll()) as { id: string }[];
    const result = await ExamplesService.get({ id: examples[0].id, format: 'markdown' });
    expect(result).toBeDefined();
    expect((ExamplesService.get as ToolMethod<unknown>).metadata.name).toBe('get');
    expect((ExamplesService.get as ToolMethod<unknown>).metadata.command).toBe('get');
    expect((ExamplesService.get as ToolMethod<unknown>).metadata.summary).toBe(
      'Get the full template of a known example or pattern by id.'
    );
    expect((ExamplesService.get as ToolMethod<unknown>).metadata.inputSchema?.properties?.id).toBeDefined();
    expect((ExamplesService.get as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
    expect((ExamplesService.get as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('id');
  });

  it('should provide search tool with JSON format', async () => {
    const results = await ExamplesService.search({ query: 'button', format: 'json' });
    const { id, entrypoint, template } = results[0] as Example;
    expect(id).toBeTruthy();
    expect(entrypoint).toBeTruthy();
    expect(template).toBeTruthy();
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search Elements (nve-*) pattern usage examples by name, element type, or keywords. Returns up to 5 matching examples with full template code. Hint: use the list tool to get a list of all available examples and patterns first if unsure of what to search.'
    );
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });

  it('should return markdown for a known example id', async () => {
    const examples = getPublicExamples('json', await ExamplesService.getAll()) as { id: string }[];
    const result = await ExamplesService.get({ id: examples[0].id, format: 'markdown' });
    expect(typeof result).toBe('string');
    expect(result).toContain(examples[0].id);
  });

  it('should return json for a known example id', async () => {
    const examples = (await ExamplesService.list({ format: 'json' })) as Example[];
    const result = (await ExamplesService.get({ id: examples[0].id, format: 'json' })) as Example;
    expect(result).toBeDefined();
    expect(result.id).toBe(examples[0].id);
    expect(result.template).toBeTruthy();
  });

  it('should match example id case-insensitively', async () => {
    const examples = (await ExamplesService.list({ format: 'json' })) as Example[];
    const upperId = examples[0].id.toUpperCase();
    const result = (await ExamplesService.get({ id: upperId, format: 'json' })) as Example;
    expect(result).toBeDefined();
    expect(result.id.toLowerCase()).toBe(examples[0].id.toLowerCase());
  });

  it('should return not-found message for unknown example id (markdown)', async () => {
    const result = await ExamplesService.get({ id: 'nonexistent-example-xyz', format: 'markdown' });
    expect(result).toBe('Example not found. Use the list tool to get a list of all available examples and patterns.');
  });

  it('should return undefined for unknown example id (json)', async () => {
    const result = await ExamplesService.get({ id: 'nonexistent-example-xyz', format: 'json' });
    expect(result).toBeUndefined();
  });

  it('should provide getAll tool for internal usage', async () => {
    const result = await ExamplesService.getAll();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return helpful message for empty search results (markdown)', async () => {
    const result = await ExamplesService.search({ query: 'nonexistent-example-xyz', format: 'markdown' });
    expect(result).toContain('No examples found matching');
    expect(result).toContain('nonexistent-example-xyz');
    expect(result).toContain('Tip:');
  });
});
