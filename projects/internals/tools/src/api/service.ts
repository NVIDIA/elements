import type { MetadataCustomElementsManifestDeclaration } from '@nve-internals/metadata';
import { MetadataService } from '@nve-internals/metadata';
import {
  type ElementVersions,
  type PartialAPIResult,
  getLatestPublishedVersions,
  getAvailableAPIs,
  searchAPIs
} from './utils.js';
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
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<PartialAPIResult[] | string> {
    const metadata = await MetadataService.getMetadata();
    return getAvailableAPIs(format, metadata);
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
  }): Promise<MetadataCustomElementsManifestDeclaration[] | string> {
    const metadata = await MetadataService.getMetadata();
    return searchAPIs(query, format, metadata);
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
    const metadata = await MetadataService.getMetadata();
    return await getLatestPublishedVersions(metadata);
  }
}
