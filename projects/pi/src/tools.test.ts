// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';
import type { ManagedToolMethod, ToolOutput } from '@internals/tools';
import { createPiToolDefinition, getPiTools, registerElementsTools } from './tools.js';

function createManagedTool(
  handler: (input: Record<string, unknown>) => Promise<ToolOutput>
): ManagedToolMethod<unknown> {
  const tool = handler as ManagedToolMethod<unknown>;
  tool.metadata = {
    name: 'get',
    title: 'API Get',
    command: 'api.get',
    toolName: 'api_get',
    summary: 'Get API details.',
    support: 0,
    outputSchema: { type: 'object', properties: { ok: { type: 'boolean' } } },
    inputSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', default: '/stale' },
        format: { type: 'string', default: 'markdown' }
      }
    }
  };
  return tool;
}

const context = { cwd: '/project' } as ExtensionContext;

describe('Elements Pi tools', () => {
  it('should expose the exact namespaced catalog', () => {
    expect(getPiTools().map(tool => `nvidia_elements_${tool.metadata.toolName}`)).toEqual([
      'nvidia_elements_api_list',
      'nvidia_elements_api_get',
      'nvidia_elements_api_validate',
      'nvidia_elements_api_imports_get',
      'nvidia_elements_api_tokens_list',
      'nvidia_elements_api_icons_list',
      'nvidia_elements_examples_list',
      'nvidia_elements_examples_get',
      'nvidia_elements_project_validate',
      'nvidia_elements_packages_list',
      'nvidia_elements_packages_get',
      'nvidia_elements_packages_changelogs_get'
    ]);
  });

  it('should create a namespaced definition with guidance', () => {
    const definition = createPiToolDefinition(createManagedTool(async () => ({ status: 'complete' })));
    expect(definition.name).toBe('nvidia_elements_api_get');
    expect(definition.label).toBe('API Get');
    expect(definition.promptGuidelines).toContain(
      'Use nvidia_elements_api_get before authoring or changing any nve-* API usage.'
    );
    expect(definition.outputSchema).toMatchObject({
      properties: { result: { type: 'object', properties: { ok: { type: 'boolean' } } } }
    });
    expect(definition.annotations).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    });
  });

  it('should apply defaults and forward progress', async () => {
    const handler = vi.fn(async (_input: Record<string, unknown>) => ({
      status: 'complete' as const,
      result: { ok: true }
    }));
    const definition = createPiToolDefinition(createManagedTool(handler));
    const onUpdate = vi.fn();
    const result = await definition.execute('call', {}, undefined, onUpdate, context);
    const input = handler.mock.calls[0]?.[0];
    expect(input).toMatchObject({ cwd: '/project', format: 'markdown' });
    expect(input?.onProgress).toBeTypeOf('function');
    const onProgress = input?.onProgress;
    if (typeof onProgress === 'function') onProgress('Loading');
    expect(onUpdate).toHaveBeenCalledWith({
      content: [{ type: 'text', text: 'Loading' }],
      details: { toolName: 'nvidia_elements_api_get' }
    });
    expect(result.details.result).toEqual({ ok: true });
    expect(result).toMatchObject({ structuredContent: { status: 'complete', result: { ok: true } } });
  });

  it('should preserve explicit working directories', async () => {
    const handler = vi.fn(async () => ({ status: 'complete' as const }));
    const definition = createPiToolDefinition(createManagedTool(handler));
    await definition.execute('call', { cwd: '/other' }, undefined, undefined, context);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/other' }));
  });

  it('should translate managed tool errors into Pi errors', async () => {
    const definition = createPiToolDefinition(
      createManagedTool(async () => ({ status: 'error', message: 'Unknown component', result: { ok: false } }))
    );
    await expect(definition.execute('call', {}, undefined, undefined, context)).rejects.toThrow('Unknown component');
  });

  it('should identify project validation as reaching the package registry', () => {
    const tool = createManagedTool(async () => ({ status: 'complete' }));
    tool.metadata.toolName = 'project_validate';
    expect(createPiToolDefinition(tool).annotations.openWorldHint).toBe(true);
  });

  it('should register every supported tool', () => {
    const registerTool = vi.fn();
    registerElementsTools({ registerTool } as unknown as ExtensionAPI);
    expect(registerTool).toHaveBeenCalledTimes(12);
  });

  it('should warn and continue when registration fails', () => {
    const registerTool = vi.fn(() => {
      throw new Error('duplicate');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    registerElementsTools({ registerTool } as unknown as ExtensionAPI);
    expect(warn).toHaveBeenCalledTimes(12);
    expect(warn).toHaveBeenNthCalledWith(1, {
      event: 'elements.tool.registration_failed',
      toolName: 'api_list',
      error: expect.any(Error)
    });
    warn.mockRestore();
  });
});
