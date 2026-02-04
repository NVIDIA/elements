import { ApiService as MetadataApiService, type Attribute, type Element } from '@nve-internals/metadata';
import type { TemplateLintMessage } from '@nvidia-elements/lint/eslint/internals';
import { type PartialAPIResult, findPublicAPIChangelog, getPublicAPIs, searchPublicAPIs } from './utils.js';
import { service, tool } from '../internal/tools.js';
import { markdownDescription } from '../internal/utils.js';
import { eslintSchema } from '../internal/schema.js';

const MAX_RESULT_LIMIT = 5;

@service()
export class ApiService {
  @tool({
    description: 'Get list of all available Elements (nve-*) APIs and components.',
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
    return getPublicAPIs(format, apis);
  }

  @tool({
    description:
      'Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `Search query (e.g., "button", "form validation", "navigation components"). Maximum ${MAX_RESULT_LIMIT} results returned.`
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
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'object', additionalProperties: true } }]
    }
  })
  static async search({
    query,
    format
  }: {
    query: string;
    format: 'markdown' | 'json';
  }): Promise<(Element | Attribute)[] | string> {
    const results = await searchPublicAPIs(query, { limit: MAX_RESULT_LIMIT });

    if (results.length === 0) {
      const message = `No components or APIs found matching "${query}".\n\nTip: Use the list tool to get a list of all available components and attribute APIs.`;
      return format === 'markdown' ? message : results;
    }

    return format === 'json'
      ? results.map(r => ({ ...r, markdown: undefined }))
      : results.map(r => r.markdown).join('\n\n---\n\n');
  }

  @tool({
    description: 'Get the documentation of a known Elements component or API by its name (nve-*).',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `A single component or attribute name (e.g., "nve-button", "nve-grid", "nve-layout"). Use the list tool to get a list of all available components and attributes or search tool for semantic searching.`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['name'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }]
    }
  })
  static async get({
    name,
    format
  }: {
    name: string;
    format: 'markdown' | 'json';
  }): Promise<Element | Attribute | string> {
    const results = await searchPublicAPIs(name, { limit: 1 });
    const result = results.find(r => r.name === name);

    if (!result) {
      return `No components or APIs found matching "${name}".\n\nTip: Use the list tool to get a list of all available components and attributes.`;
    }

    return format === 'json' ? { ...result, markdown: undefined } : result.markdown;
  }

  @tool({
    description:
      'Validates HTML templates using Elements APIs and components (nve-*). Checks for invalid API usage and UX patterns. Use this to catch errors before rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description:
            'HTML template string containing Elements components (e.g., nve-*, nve-button, nve-input). Can be a full document or fragment.'
        }
      },
      required: ['template']
    },
    outputSchema: {
      oneOf: [
        { type: 'array', maxItems: 0 },
        {
          type: 'array',
          items: eslintSchema,
          description: 'ESLint warning and error messages.',
          additionalProperties: false
        }
      ]
    }
  })
  static async templateValidate({ template }: { template: string }): Promise<TemplateLintMessage[]> {
    if (process.env.ELEMENTS_ENV === 'mcp' || process.env.ELEMENTS_ENV === 'cli') {
      const { lintTemplate } = await import('@nvidia-elements/lint/eslint/internals');
      return await lintTemplate(template);
    } else {
      return [];
    }
  }

  @tool({
    description: 'Get the changelog details for a specific component or API.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: ''
        }
      },
      required: ['template']
    },
    outputSchema: { type: 'string' }
  })
  static async changelogsGet({ name }: { name: string }): Promise<string> {
    const result = await findPublicAPIChangelog(name);

    if (!result) {
      return `No components or APIs found matching "${name}".\n\nTip: Use the list tool to get a list of all available components and attributes.`;
    }

    return result;
  }
}
