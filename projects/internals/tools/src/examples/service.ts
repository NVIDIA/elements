// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ExamplesService as ExamplesServiceMetadata, type Example } from '@internals/metadata';
import { service, tool, ToolSupport } from '../internal/tools.js';
import { getPublicExamples, renderExampleMarkdown, searchPublicExamples } from './utils.js';
import { markdownDescription } from '../internal/utils.js';

const MAX_RESULT_LIMIT = 5;

@service()
export class ExamplesService {
  @tool({
    summary: 'Get list of available Elements (nve-*) patterns and examples.',
    description:
      'Get a summary list of available Elements (nve-*) component/pattern usage examples and code snippets. Use this to browse all available examples.',
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
    const results = getPublicExamples(format, examples);

    if (format === 'json') {
      return (results as Example[]).map(e => ({ id: e.id, summary: e.summary }));
    }

    return results as string;
  }

  @tool({
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
  static async get({ id, format }: { id: string; format: 'markdown' | 'json' }): Promise<Example | string | undefined> {
    const results = (await getPublicExamples('json', await ExamplesServiceMetadata.getData())) as Example[];
    const found = results.find(r => r.id.toLocaleLowerCase() === id.toLowerCase());

    if (format === 'json') {
      return found;
    }

    const markdown = found?.template
      ? renderExampleMarkdown(found)
      : 'Example not found. Use the list tool to get a list of all available examples and patterns.';
    return markdown;
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
    return await searchPublicExamples(query, { format, limit: MAX_RESULT_LIMIT });
  }

  static async getAll(): Promise<Example[]> {
    return ExamplesServiceMetadata.getData();
  }
}
