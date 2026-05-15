// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ExamplesService as ExamplesServiceMetadata, type Example } from '@internals/metadata';
import type { TemplateLintMessage } from '@nvidia-elements/lint/eslint/internals';
import { service, tool, ToolError, ToolSupport } from '../internal/tools.js';
import { getContextExamples, renderExampleMarkdown, searchContextExamples } from './utils.js';
import { markdownDescription } from '../internal/utils.js';
import { eslintSchema } from '../internal/schema.js';

const MAX_RESULT_LIMIT = 5;

@service()
export class ExamplesService {
  @tool({
    summary: 'Get list of available Elements (nve-*) starter templates, patterns and examples.',
    description:
      'Get a summary list of available Elements (nve-*) starter templates, patterns and example code snippets. Use this to browse all available examples.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              summary: { type: 'string' }
            },
            additionalProperties: false
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<{ id: string; summary: string }[] | string> {
    const examples = await ExamplesServiceMetadata.getData();
    const results = getContextExamples(format, examples);

    if (format === 'json') {
      return (results as Example[]).map(e => ({ id: e.id, summary: e.summary }));
    }

    return results as string;
  }

  @tool({
    app: { resourceUri: 'ui://elements/example-preview' },
    summary: 'Get the full template of a known example or pattern by id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: `The id of the example or pattern to get the full template of.`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['id'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }]
    }
  })
  static async get({ id, format }: { id: string; format: 'markdown' | 'json' }): Promise<Example | string> {
    const results = (await getContextExamples('json', await ExamplesServiceMetadata.getData())) as Example[];
    const found = results.find(r => r.id.toLocaleLowerCase() === id.toLowerCase());

    if (!found) {
      throw new Error(`Unknown example "${id}". Use the examples_list tool to get a list of all available examples.`);
    }

    if (format === 'json') {
      return found;
    }

    return renderExampleMarkdown(found);
  }

  @tool({
    support: ToolSupport.None,
    summary: `Search available Elements (nve-*) patterns and examples.`,
    description: `Search Elements (nve-*) pattern usage examples by name, element type, or keywords. Returns up to ${MAX_RESULT_LIMIT} matching examples with full template code. Hint: use the list tool to get a list of all available examples and patterns first if unsure of what to search.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `Search query for matching example templates/patterns. Maximum ${MAX_RESULT_LIMIT} results will be returned.`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['query'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              summary: { type: 'string' },
              description: { type: 'string' },
              template: { type: 'string' },
              entrypoint: { type: 'string' },
              element: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            },
            additionalProperties: false,
            required: ['id', 'name', 'summary', 'element']
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async search({ query, format }: { query: string; format: 'markdown' | 'json' }): Promise<Example[] | string> {
    return await searchContextExamples(query, { format, limit: MAX_RESULT_LIMIT });
  }

  @tool({
    app: { resourceUri: 'ui://elements/example-preview' },
    support: ToolSupport.MCP,
    summary: 'Render a custom Elements (nve-*) HTML template inline in the chat UI.',
    description: `Render an ad-hoc Elements (nve-*) HTML template in the MCP App preview iframe. The template is linted against Elements APIs before rendering. Lint failures return a tool error instead of rendering the template. Use this to preview compositions you author. Templates should be self-contained HTML — the iframe loads the Elements bundle and themes automatically.`,
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description: 'HTML template to render. Should use Elements (nve-*) components.'
        },
        name: {
          type: 'string',
          description: 'Optional human-readable label for the preview.'
        }
      },
      required: ['template'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string' },
        name: { type: 'string' },
        lintMessages: {
          type: 'array',
          items: eslintSchema,
          description: 'Lint messages. Empty on success; non-empty when returned with status error.'
        }
      },
      additionalProperties: false,
      required: ['template', 'lintMessages']
    }
  })
  static async render({
    template,
    name
  }: {
    template: string;
    name?: string;
  }): Promise<{ template: string; name?: string; lintMessages: TemplateLintMessage[] }> {
    const { lintTemplate } = await import('@nvidia-elements/lint/eslint/internals');
    const lintMessages = await lintTemplate(template, { strict: true });
    if (lintMessages.length) {
      throw new ToolError('Template validation failed.', { template, name, lintMessages });
    }
    return { template, name, lintMessages };
  }

  static async getAll(): Promise<Example[]> {
    return ExamplesServiceMetadata.getData();
  }
}
