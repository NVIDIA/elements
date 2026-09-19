// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { extname } from 'node:path';
import {
  isEditToolResult,
  isWriteToolResult,
  type ExtensionAPI,
  type ExtensionContext,
  type ToolResultEvent
} from '@earendil-works/pi-coding-agent';
import type { ManagedToolMethod, ToolOutput } from '@internals/tools';
import { piLogger } from './logging.js';
import { getPiTools } from './tools.js';

const commandName = 'elements-auto-validate';
const disableFlagName = `no-${commandName}`;

interface AutoValidationOptions {
  validationTool?: ManagedToolMethod<unknown>;
}

interface AutoValidationState {
  enabled: boolean;
  validationTool: ManagedToolMethod<unknown>;
  pendingByParentId: Map<string, string[]>;
}

type AutoValidationDecision = 'skipped_disabled' | 'skipped_ineligible_path' | 'sent_for_validation';

function getValidationTool(options: AutoValidationOptions): ManagedToolMethod<unknown> {
  const validationTool = options.validationTool ?? getPiTools().find(tool => tool.metadata.toolName === 'api_validate');
  if (!validationTool) throw new Error('Elements validation tool not found.');
  return validationTool;
}

function getEditedHtmlPath(event: ToolResultEvent): string | undefined {
  if (event.isError || (!isEditToolResult(event) && !isWriteToolResult(event))) return undefined;
  const path = event.input.path;
  if (typeof path !== 'string' || !['.htm', '.html'].includes(extname(path).toLowerCase())) return undefined;
  return path;
}

function getParentToolCallId(event: ToolResultEvent): string | undefined {
  return 'parentToolCallId' in event && typeof event.parentToolCallId === 'string' ? event.parentToolCallId : undefined;
}

function formatValidationOutput(output: ToolOutput): string {
  if (output.status === 'error')
    return `Elements automatic validation could not run: ${output.message ?? 'Unknown error'}`;
  const result = output.result;
  const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  return `Elements automatic validation:\n\n${text ?? output.message ?? 'Complete'}`;
}

function updateAutoValidation(args: string, enabled: boolean, ctx: ExtensionContext): boolean {
  const value = args.trim().toLowerCase();
  if (value === 'status') {
    ctx.ui.notify(`Elements automatic validation is ${enabled ? 'enabled' : 'disabled'}.`);
    return enabled;
  }
  if (value && value !== 'on' && value !== 'off') {
    ctx.ui.notify(`Use /${commandName} [on|off|status].`, 'warning');
    return enabled;
  }
  const nextEnabled = value === 'on' || (value === '' && !enabled);
  ctx.ui.notify(`Elements automatic validation ${nextEnabled ? 'enabled' : 'disabled'}.`);
  return nextEnabled;
}

function logEnabledChange(source: 'command' | 'session_start', enabled: boolean, reason?: string): void {
  piLogger.info({
    event: 'elements.auto_validation.enabled_changed',
    source,
    ...(reason ? { reason } : {}),
    enabled
  });
}

function logToolResultDecision(event: ToolResultEvent, decision: AutoValidationDecision): void {
  piLogger.info({
    event: 'elements.auto_validation.tool_result',
    decision,
    toolName: event.toolName,
    toolCallId: event.toolCallId
  });
}

function getValidationFailureMessage(event: ToolResultEvent): string {
  piLogger.warn({
    event: 'elements.auto_validation.validation_failed',
    toolName: event.toolName,
    toolCallId: event.toolCallId
  });
  return 'Elements automatic validation could not run.';
}

function appendValidation(
  event: ToolResultEvent,
  text: string,
  pendingByParentId: Map<string, string[]>
): { content: ToolResultEvent['content'] } {
  const parentId = getParentToolCallId(event);
  if (parentId) {
    const pending = pendingByParentId.get(parentId) ?? [];
    pending.push(text);
    pendingByParentId.set(parentId, pending);
  }
  return { content: [...event.content, { type: 'text', text }] };
}

function getParentValidation(
  event: ToolResultEvent,
  pendingByParentId: Map<string, string[]>
): { content: ToolResultEvent['content'] } | undefined {
  const pending = pendingByParentId.get(event.toolCallId);
  if (!pending) return;
  pendingByParentId.delete(event.toolCallId);
  if (event.toolName !== 'codemode') return;
  const existingText = event.content
    .filter(content => content.type === 'text')
    .map(content => content.text)
    .join('\n');
  const missing = pending.filter(result => !existingText.includes(result));
  if (missing.length === 0) return;
  return { content: [...event.content, ...missing.map(text => ({ type: 'text' as const, text }))] };
}

async function handleToolResult(
  event: ToolResultEvent,
  ctx: ExtensionContext,
  state: AutoValidationState
): Promise<{ content: ToolResultEvent['content'] } | undefined> {
  const parentValidation = getParentValidation(event, state.pendingByParentId);
  if (parentValidation) return parentValidation;
  if (!state.enabled) {
    logToolResultDecision(event, 'skipped_disabled');
    return;
  }
  const path = getEditedHtmlPath(event);
  if (!path) {
    logToolResultDecision(event, 'skipped_ineligible_path');
    return;
  }
  logToolResultDecision(event, 'sent_for_validation');
  try {
    const output = await state.validationTool({ paths: [path], format: 'markdown', cwd: ctx.cwd });
    return appendValidation(event, formatValidationOutput(output), state.pendingByParentId);
  } catch {
    return appendValidation(event, getValidationFailureMessage(event), state.pendingByParentId);
  }
}

/**
 * Registers automatic Elements validation with Pi.
 *
 * The registration adds the `--no-elements-auto-validate` flag, the
 * `/elements-auto-validate` session command, and session and tool-result hooks. By default, the
 * bundled validation tool runs with Markdown output. Callers can provide a compatible validation
 * tool through `options.validationTool`, primarily for integration and testing.
 *
 * Successful Pi `edit` and `write` results for paths ending in `.html` or `.htm`, matched without
 * regard to case, run validation from the current extension working directory. The hook appends a
 * formatted validation result to the existing tool-result content. For nested calls, it also
 * appends the result to the parent tool's output so Codemode scripts cannot silently discard it.
 * Disabled validation, failed tool calls, other tools, and unsupported paths leave the result unchanged.
 *
 * @param pi - Pi's extension API, used to register the flag, command, and event hooks.
 * @param options - Optional validation tool override.
 * @returns Nothing.
 */
export function registerElementsAutoValidation(pi: ExtensionAPI, options: AutoValidationOptions = {}): void {
  const state: AutoValidationState = {
    enabled: true,
    validationTool: getValidationTool(options),
    pendingByParentId: new Map()
  };

  pi.registerFlag(disableFlagName, {
    description: 'Disable automatic Elements validation after HTML edit and write tool calls.',
    type: 'boolean',
    default: false
  });

  pi.on('session_start', event => {
    state.pendingByParentId.clear();
    const nextEnabled = pi.getFlag(disableFlagName) !== true;
    if (nextEnabled !== state.enabled) logEnabledChange('session_start', nextEnabled, event.reason);
    state.enabled = nextEnabled;
  });

  pi.on('agent_end', () => state.pendingByParentId.clear());
  pi.on('session_shutdown', () => state.pendingByParentId.clear());

  pi.registerCommand(commandName, {
    description: 'Toggle automatic Elements validation after HTML edits.',
    handler: async (args, ctx) => {
      const nextEnabled = updateAutoValidation(args, state.enabled, ctx);
      if (nextEnabled !== state.enabled) logEnabledChange('command', nextEnabled);
      state.enabled = nextEnabled;
    }
  });

  pi.on('tool_result', (event, ctx) => handleToolResult(event, ctx, state));
}
