import { ExamplesService as ExamplesServiceMetadata, type Example } from '@internals/metadata';
import { service, tool } from '../internal/tools.js';
import { getPublicExamples, searchPublicExamples } from './utils.js';
import { markdownDescription } from '../internal/utils.js';

const MAX_RESULT_LIMIT = 5;

@service()
export class ExamplesService {
  @tool({
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
              name: { type: 'string' },
              summary: { type: 'string' },
              element: { type: 'string' }
            },
            additionalProperties: false,
            required: ['id', 'name', 'summary', 'element']
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
    return getPublicExamples(format, examples);
  }

  @tool({
    description: `Search Elements (nve-*) pattern usage examples by name, element type, or keywords. Returns up to ${MAX_RESULT_LIMIT} matching examples with full template code.`,
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
      required: ['query']
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
  static async search({
    query,
    format = 'markdown'
  }: {
    query: string;
    format?: 'markdown' | 'json';
  }): Promise<Example[] | string> {
    return await searchPublicExamples(query, { format, limit: MAX_RESULT_LIMIT });
  }

  static async getAll(): Promise<Example[]> {
    return ExamplesServiceMetadata.getData();
  }
}
