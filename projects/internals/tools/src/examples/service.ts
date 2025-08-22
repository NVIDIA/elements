import { MetadataService, type MetadataExample } from '@internals/metadata';
import { service, tool } from '../internal/tools.js';
import { getAvailableExamples, searchExamples } from './utils.js';

@service()
export class ExamplesService {
  @tool({
    description: 'Get list of available example templates/patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
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
              description: { type: 'string' },
              template: { type: 'string' },
              element: { type: 'string' },
              entrypoint: { type: 'string' }
            },
            additionalProperties: false,
            required: ['id', 'description', 'template', 'element', 'entrypoint']
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<{ id: string; description: string }[] | string> {
    const examples = await MetadataService.getExamples();
    return getAvailableExamples(format, examples);
  }

  @tool({
    description: 'Search for example templates/patterns by name or description.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for matching example templates/patterns' },
        format: {
          type: 'string',
          description: 'Format of the output contents. `markdown` | `json`',
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['query']
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'array' }],
      additionalProperties: false
    }
  })
  static async search({
    query,
    format = 'markdown'
  }: {
    query: string;
    format?: 'markdown' | 'json';
  }): Promise<MetadataExample[] | string> {
    const examples = await MetadataService.getExamples();
    return searchExamples(query, format, examples);
  }

  static async getAll(): Promise<MetadataExample[]> {
    return MetadataService.getExamples();
  }
}
