import {
  ProjectsService,
  ApiService as MetadataApiService,
  type Attribute,
  type Element
} from '@internals/metadata';
import { type ElementVersions, type PartialAPIResult, getLatestPublishedVersions, getAvailableAPIs } from './utils.js';
import { service, tool } from '../internal/tools.js';

@service()
export class ApiService {
  @tool({
    description: 'Get list of all available APIs and components.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'Format of the output contents. `markdown` | `json`',
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['format'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            elements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  behavior: { type: 'string' }
                },
                additionalProperties: false,
                required: ['name', 'description', 'behavior']
              }
            },
            attributes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  behavior: { type: 'string' }
                },
                additionalProperties: false,
                required: ['name', 'description', 'behavior']
              }
            }
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<{ elements: PartialAPIResult[]; attributes: PartialAPIResult[] } | string> {
    const apis = await MetadataApiService.getData();
    return getAvailableAPIs(format, apis);
  }

  @tool({
    description: 'Get API information for specific APIs and components.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'User query requesting for information about how to use nve-* APIs'
        },
        format: {
          type: 'string',
          description: 'Format of the output. `markdown` | `json`',
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['query'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'array' }],
      additionalProperties: false
    }
  })
  static async search({
    query,
    format
  }: {
    query: string;
    format: 'markdown' | 'json';
  }): Promise<(Element | Attribute)[] | string> {
    const results = (await MetadataApiService.search(query)).slice(0, 5);
    return format === 'markdown' ? results.map(r => r.markdown).join('\n\n---\n\n') : results;
  }

  @tool({
    description: 'Get latest versions of elements/@nve packages.',
    outputSchema: {
      type: 'object',
      patternProperties: {
        '^.*$': { type: 'string' }
      },
      additionalProperties: false
    }
  })
  static async version(): Promise<ElementVersions> {
    const projects = (await ProjectsService.getData()).data.filter(p => p.changelog);
    return await getLatestPublishedVersions(projects);
  }
}
