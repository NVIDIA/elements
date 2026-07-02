// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Example } from '@internals/metadata';
import { ExamplesService } from './service.js';
import { getContextExamples } from './utils.js';
import { loadTools, type ToolMethod, type ToolOutput } from '../internal/tools.js';
import { ApiService } from '../api/service.js';

describe('ExampleService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide list tool', async () => {
    const result = await ExamplesService.list();
    expect(result).toBeDefined();
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get a summary list of available Elements (nve-*) starter templates, patterns and example code snippets. Use this to browse all available examples.'
    );
  });

  it('should provide search tool', async () => {
    const result = await ExamplesService.search({ query: 'button', format: 'markdown' });
    expect(result).toBeDefined();
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search Elements (nve-*) pattern usage examples by name, element type, or keywords. Returns up to 3 matching examples with full template code. Hint: use the list tool to get a list of all available examples and patterns first if unsure of what to search.'
    );
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });

  it('should provide get tool', async () => {
    const examples = getContextExamples('json', await ExamplesService.getAll()) as { id: string }[];
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
      'Search Elements (nve-*) pattern usage examples by name, element type, or keywords. Returns up to 3 matching examples with full template code. Hint: use the list tool to get a list of all available examples and patterns first if unsure of what to search.'
    );
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });

  it('should return markdown for a known example id', async () => {
    const examples = getContextExamples('json', await ExamplesService.getAll()) as { id: string }[];
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

  it('should reject unknown example id (markdown)', async () => {
    await expect(ExamplesService.get({ id: 'nonexistent-example-xyz', format: 'markdown' })).rejects.toThrow(
      'Unknown example "nonexistent-example-xyz". Use the examples_list tool to get a list of all available examples.'
    );
  });

  it('should reject unknown example id (json)', async () => {
    await expect(ExamplesService.get({ id: 'nonexistent-example-xyz', format: 'json' })).rejects.toThrow(
      'Unknown example "nonexistent-example-xyz". Use the examples_list tool to get a list of all available examples.'
    );
  });

  it('should return a managed tool error for unknown example id', async () => {
    const tools = loadTools(ExamplesService);
    const getTool = tools.find(tool => tool.metadata.name === 'get');

    const result = (await getTool?.({ id: 'nonexistent-example-xyz', format: 'json' })) as ToolOutput<
      Example | undefined
    >;

    expect(result.status).toBe('error');
    expect(result.message).toBe(
      'Unknown example "nonexistent-example-xyz". Use the examples_list tool to get a list of all available examples.'
    );
    expect(result.result).toBeUndefined();
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

  it('should provide render tool that echoes a validated template', async () => {
    const template = '<nve-button>hello</nve-button>';
    const result = await ExamplesService.render({ template, name: 'Hello button' });
    expect(result.template).toBe(template);
    expect(result.name).toBe('Hello button');
    expect(Array.isArray(result.lintMessages)).toBe(true);
    expect((ExamplesService.render as ToolMethod<unknown>).metadata.name).toBe('render');
    expect((ExamplesService.render as ToolMethod<unknown>).metadata.app?.resourceUri).toBe(
      'ui://elements/example-preview'
    );
    expect((ExamplesService.render as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('template');
  });

  it('should accept render tool without an explicit name', async () => {
    const result = await ExamplesService.render({ template: '<nve-button>x</nve-button>' });
    expect(result.template).toBe('<nve-button>x</nve-button>');
    expect(result.name).toBeUndefined();
  });

  it('should reject render tool templates with lint messages', async () => {
    vi.spyOn(ApiService, 'templateValidate').mockResolvedValue([
      {
        id: 'invalid-template',
        severity: 'error',
        message: 'Invalid template.',
        suggestions: [],
        line: 1,
        column: 2,
        endLine: 1,
        endColumn: 3
      }
    ]);

    await expect(ExamplesService.render({ template: '<nve-invalid></nve-invalid>' })).rejects.toThrow(
      'Template validation failed.'
    );
  });

  it('should return a managed tool error when render validation fails', async () => {
    vi.spyOn(ApiService, 'templateValidate').mockResolvedValue([
      {
        id: 'invalid-template',
        severity: 'error',
        message: 'Invalid template.',
        suggestions: [],
        line: 1,
        column: 2,
        endLine: 1,
        endColumn: 3
      }
    ]);
    const tools = loadTools(ExamplesService);
    const renderTool = tools.find(tool => tool.metadata.name === 'render');

    const result = (await renderTool?.({ template: '<nve-invalid></nve-invalid>' })) as ToolOutput<{
      template: string;
      lintMessages: { message: string }[];
    }>;

    expect(result.status).toBe('error');
    expect(result.message).toBe('Template validation failed.');
    expect(result.result?.template).toBe('<nve-invalid></nve-invalid>');
    expect(result.result?.lintMessages).toHaveLength(1);
    expect(result.result?.lintMessages[0]?.message).toBe('Unexpected use of unknown tag <nve-invalid>');
  });
});
