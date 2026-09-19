// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
  ToolResultEvent
} from '@earendil-works/pi-coding-agent';
import type { ManagedToolMethod, ToolOutput } from '@internals/tools';
import { registerElementsAutoValidation } from './auto-validation.js';

interface ToolResultPatch {
  content?: ToolResultEvent['content'];
}

function createValidationTool(handler: () => Promise<ToolOutput>): ManagedToolMethod<unknown> {
  const tool = handler as ManagedToolMethod<unknown>;
  tool.metadata = {
    name: 'validate',
    title: 'API Validate',
    command: 'api.validate',
    toolName: 'api_validate',
    summary: 'Validate HTML.',
    support: 0
  };
  return tool;
}

function createHarness(flagDisabled = false) {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const commands = new Map<string, (args: string, ctx: ExtensionCommandContext) => Promise<void>>();
  const notify = vi.fn();
  const pi = {
    getFlag: vi.fn(() => flagDisabled),
    on: vi.fn((event: string, handler: (...args: unknown[]) => unknown) => handlers.set(event, handler)),
    registerCommand: vi.fn(
      (name: string, command: { handler: (args: string, ctx: ExtensionCommandContext) => Promise<void> }) =>
        commands.set(name, command.handler)
    ),
    registerFlag: vi.fn()
  } as unknown as ExtensionAPI;
  const context = {
    cwd: '/project',
    signal: undefined,
    ui: { notify }
  } as unknown as ExtensionContext;
  return { commands, context, handlers, notify, pi };
}

function writeEvent(path: string, isError = false): ToolResultEvent {
  return {
    type: 'tool_result',
    toolCallId: 'write-call',
    toolName: 'write',
    input: { path, content: '<nve-button></nve-button>' },
    content: [{ type: 'text', text: 'Wrote file.' }],
    details: undefined,
    isError
  };
}

describe('Elements automatic validation', () => {
  let info: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    info.mockRestore();
  });

  it('should use the bundled validation tool by default', () => {
    const harness = createHarness();
    expect(() => registerElementsAutoValidation(harness.pi)).not.toThrow();
  });

  it('should register an opt-out flag and command', () => {
    const harness = createHarness();
    const validationTool = createValidationTool(async () => ({ status: 'complete' }));
    registerElementsAutoValidation(harness.pi, { validationTool });
    expect(harness.pi.registerFlag).toHaveBeenCalledWith('no-elements-auto-validate', {
      description: 'Disable automatic Elements validation after HTML edit and write tool calls.',
      type: 'boolean',
      default: false
    });
    expect(harness.pi.registerCommand).toHaveBeenCalledWith(
      'elements-auto-validate',
      expect.objectContaining({ description: expect.any(String), handler: expect.any(Function) })
    );
  });

  it('should append validation after successful HTML writes by default', async () => {
    const harness = createHarness();
    const validationTool = vi.fn(async () => ({
      status: 'complete' as const,
      result: '## Validation passed\n\n1 file, 0 errors, 0 warnings'
    })) as unknown as ManagedToolMethod<unknown>;
    validationTool.metadata = createValidationTool(async () => ({ status: 'complete' })).metadata;
    registerElementsAutoValidation(harness.pi, { validationTool });
    await harness.handlers.get('session_start')?.({ type: 'session_start', reason: 'startup' }, harness.context);
    const result = (await harness.handlers.get('tool_result')?.(
      writeEvent('page.html'),
      harness.context
    )) as ToolResultPatch;
    expect(validationTool).toHaveBeenCalledWith({ paths: ['page.html'], format: 'markdown', cwd: '/project' });
    expect(result.content).toEqual([
      { type: 'text', text: 'Wrote file.' },
      {
        type: 'text',
        text: 'Elements automatic validation:\n\n## Validation passed\n\n1 file, 0 errors, 0 warnings'
      }
    ]);
  });

  it('should honor the disable flag and ignore failed or non-HTML writes', async () => {
    const harness = createHarness(true);
    const validationTool = vi.fn(async () => ({
      status: 'complete' as const
    })) as unknown as ManagedToolMethod<unknown>;
    validationTool.metadata = createValidationTool(async () => ({ status: 'complete' })).metadata;
    registerElementsAutoValidation(harness.pi, { validationTool });
    const handler = harness.handlers.get('tool_result');
    await harness.handlers.get('session_start')?.({ type: 'session_start', reason: 'startup' }, harness.context);
    await handler?.(writeEvent('page.html'), harness.context);
    await harness.commands.get('elements-auto-validate')?.('on', harness.context as ExtensionCommandContext);
    await handler?.(writeEvent('package.json'), harness.context);
    await handler?.(writeEvent('page.html', true), harness.context);
    expect(validationTool).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'elements.auto_validation.tool_result',
        decision: 'skipped_disabled'
      })
    );
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'elements.auto_validation.tool_result',
        decision: 'skipped_ineligible_path'
      })
    );
  });

  it('should toggle validation for the current session', async () => {
    const harness = createHarness();
    const validationTool = createValidationTool(async () => ({ status: 'complete' }));
    registerElementsAutoValidation(harness.pi, { validationTool });
    const command = harness.commands.get('elements-auto-validate');
    await command?.('on', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Elements automatic validation enabled.');
    await command?.('status', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Elements automatic validation is enabled.');
    await command?.('off', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Elements automatic validation disabled.');
    expect(info).toHaveBeenCalledWith({
      event: 'elements.auto_validation.enabled_changed',
      source: 'command',
      enabled: false
    });
    await command?.('invalid', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Use /elements-auto-validate [on|off|status].', 'warning');
    await command?.('', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Elements automatic validation enabled.');
    await command?.('', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Elements automatic validation disabled.');
    await command?.('status', harness.context as ExtensionCommandContext);
    expect(harness.notify).toHaveBeenLastCalledWith('Elements automatic validation is disabled.');
    await harness.handlers.get('session_start')?.({ type: 'session_start', reason: 'startup' }, harness.context);
  });

  it('should report validation execution errors without failing the write result', async () => {
    const harness = createHarness();
    const validationTool = createValidationTool(async () => ({ status: 'error' }));
    registerElementsAutoValidation(harness.pi, { validationTool });
    await harness.handlers.get('session_start')?.({ type: 'session_start', reason: 'startup' }, harness.context);
    const result = (await harness.handlers.get('tool_result')?.(
      writeEvent('page.htm'),
      harness.context
    )) as ToolResultPatch;
    expect(result.content?.at(-1)).toEqual({
      type: 'text',
      text: 'Elements automatic validation could not run: Unknown error'
    });
  });

  it('should format structured validation output after edits', async () => {
    const harness = createHarness();
    const validationTool = createValidationTool(async () => ({
      status: 'complete',
      result: { ok: true }
    }));
    registerElementsAutoValidation(harness.pi, { validationTool });
    await harness.handlers.get('session_start')?.({ type: 'session_start', reason: 'startup' }, harness.context);
    const result = (await harness.handlers.get('tool_result')?.(
      {
        ...writeEvent('/private/project/page.html'),
        toolName: 'edit',
        details: { diff: '', patch: '' }
      },
      harness.context
    )) as ToolResultPatch;
    expect(result.content?.at(-1)).toEqual({
      type: 'text',
      text: 'Elements automatic validation:\n\n{\n  "ok": true\n}'
    });
    expect(info).toHaveBeenCalledWith({
      event: 'elements.auto_validation.tool_result',
      decision: 'sent_for_validation',
      toolName: 'edit',
      toolCallId: 'write-call'
    });
  });
});
