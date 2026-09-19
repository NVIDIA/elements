// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionAPI, ToolDefinition } from '@earendil-works/pi-coding-agent';
import { tools, type ManagedToolMethod } from '@internals/tools';
import type { TUnsafe } from 'typebox';
import { piLogger } from './logging.js';
import { renderProjectValidationResult, renderValidationResult } from './renderers.js';
import { createElementsToolResult, getElementsToolError, type ElementsToolDetails } from './results.js';
import { applyPiToolInputDefaults, createPiToolParameters } from './schema.js';

type PiToolInput = Record<string, unknown>;
type PiToolDefinition = ToolDefinition<TUnsafe<PiToolInput>, ElementsToolDetails>;

const piToolNames = [
  'api_list',
  'api_get',
  'api_validate',
  'api_imports_get',
  'api_tokens_list',
  'api_icons_list',
  'examples_list',
  'examples_get',
  'project_validate',
  'packages_list',
  'packages_get',
  'packages_changelogs_get'
] as const;

const promptMetadata: Record<string, Pick<PiToolDefinition, 'promptSnippet' | 'promptGuidelines'>> = {
  api_get: {
    promptSnippet: 'Look up NVIDIA Elements component and attribute APIs',
    promptGuidelines: ['Use elements_api_get before authoring or changing any nve-* API usage.']
  },
  api_validate: {
    promptSnippet: 'Validate NVIDIA Elements HTML and JSON content',
    promptGuidelines: ['Use elements_api_validate after editing HTML that uses nve-* APIs.']
  },
  examples_list: {
    promptSnippet: 'Browse NVIDIA Elements patterns and examples'
  },
  examples_get: {
    promptSnippet: 'Retrieve a known NVIDIA Elements example'
  }
};

function getRenderer(toolName: string): Pick<PiToolDefinition, 'renderResult'> {
  if (toolName === 'api_validate') return { renderResult: renderValidationResult };
  if (toolName === 'project_validate') return { renderResult: renderProjectValidationResult };
  return {};
}

export function getPiTools(): ManagedToolMethod<unknown>[] {
  const toolsByName = new Map(tools.map(tool => [tool.metadata.toolName, tool]));
  return piToolNames.map(toolName => {
    const tool = toolsByName.get(toolName);
    if (!tool) throw new Error(`Elements tool not found: ${toolName}`);
    return tool;
  });
}

export function createPiToolDefinition(tool: ManagedToolMethod<unknown>): PiToolDefinition {
  const toolName = `elements_${tool.metadata.toolName}`;
  return {
    name: toolName,
    label: tool.metadata.title,
    description: tool.metadata.description ?? tool.metadata.summary,
    parameters: createPiToolParameters(tool.metadata.inputSchema),
    ...promptMetadata[tool.metadata.toolName],
    ...getRenderer(tool.metadata.toolName),
    async execute(toolCallId, params, _signal, onUpdate, ctx) {
      const input = applyPiToolInputDefaults(params, tool.metadata.inputSchema, ctx.cwd);
      if (onUpdate) {
        input.onProgress = (message: string) => {
          onUpdate({ content: [{ type: 'text', text: message }], details: { toolName } });
        };
      }
      const output = await tool(input);
      if (output.status === 'error') throw getElementsToolError(output);
      return createElementsToolResult(toolCallId, toolName, output);
    }
  };
}

export function registerElementsTools(pi: ExtensionAPI): void {
  getPiTools().forEach(tool => {
    try {
      pi.registerTool(createPiToolDefinition(tool));
    } catch (error) {
      piLogger.warn({
        event: 'elements.tool.registration_failed',
        toolName: tool.metadata.toolName,
        error
      });
    }
  });
}
