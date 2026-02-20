import { ApiService as MetadataApiService, type Attribute, type Element } from '@internals/metadata';
import type { TemplateLintMessage } from '@nvidia-elements/lint/eslint/internals';
import { type PartialAPIResult, findPublicAPIChangelog, getPublicAPIs, searchPublicAPIs } from './utils.js';
import { service, tool } from '../internal/tools.js';
import { getElementImports, markdownDescription } from '../internal/utils.js';
import { eslintSchema } from '../internal/schema.js';

const MAX_RESULT_LIMIT = 5;

const listToolHelpfulTip =
  'Tip: Use the list tool to get a summary list of all available components and attribute APIs.';

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
    description: `Get the documentation for up to ${MAX_RESULT_LIMIT} known Elements components or attribute APIs by name (nve-*).`,
    inputSchema: {
      type: 'object',
      properties: {
        names: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: MAX_RESULT_LIMIT,
          description: `1 to ${MAX_RESULT_LIMIT} component or attribute names (e.g., ["nve-button"] or ["nve-button", "nve-text"]).\n\n${listToolHelpfulTip}`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['names'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'object', additionalProperties: true } }]
    }
  })
  static async get({
    names,
    format
  }: {
    names: string | string[];
    format: 'markdown' | 'json';
  }): Promise<(Element | Attribute)[] | string> {
    const nameList = Array.isArray(names) ? names : [names];
    const results = await Promise.all(
      nameList.map(async name => {
        const matches = await searchPublicAPIs(name, { limit: 1 });
        return matches.find(r => r.name === name) ?? name;
      })
    );

    const found = results.filter((r): r is Element | Attribute => typeof r !== 'string').slice(0, MAX_RESULT_LIMIT);
    const notFound = results.filter((r): r is string => typeof r === 'string');

    if (found.length === 0) {
      return `No components or APIs found matching "${notFound.join('", "')}".\n\n${listToolHelpfulTip}`;
    }

    if (format === 'json') {
      return found.map(r => ({ ...r, markdown: undefined }));
    }

    const markdown = found.map(r => r.markdown).join('\n\n---\n\n');
    const notFoundNote = notFound.length > 0 ? `\n\n---\n\nNot found: ${notFound.join(', ')}` : '';
    return markdown + notFoundNote;
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
          description: `A single component or attribute name (e.g., "nve-button", "nve-grid", "nve-layout"). Use the list tool to get a list of all available components and attributes or search tool for semantic searching.`
        }
      },
      required: ['name']
    },
    outputSchema: { type: 'string' }
  })
  static async changelogsGet({ name }: { name: string }): Promise<string> {
    const result = await findPublicAPIChangelog(name);

    if (!result) {
      return `No components or API changelogs found matching "${name}".\n\nTip: Use the list tool to get a list of all available components and attributes.`;
    }

    return result;
  }

  @tool({
    description: 'Get the esm imports for a given HTML template using Elements APIs and components (nve-*).',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string'
        }
      },
      required: ['template']
    },
    outputSchema: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  static async importsGet({ template }: { template: string }): Promise<string[]> {
    const elements = await MetadataApiService.getData();
    return getElementImports(template, elements.data.elements);
  }

  static async search({
    query,
    format
  }: {
    query: string;
    format: 'markdown' | 'json';
  }): Promise<(Element | Attribute)[] | string> {
    const results = await searchPublicAPIs(query, { limit: MAX_RESULT_LIMIT });

    if (results.length === 0) {
      const message = `No components or APIs found matching "${query}".\n\n${listToolHelpfulTip}`;
      return format === 'markdown' ? message : results;
    }

    return format === 'json'
      ? results.map(r => ({ ...r, markdown: undefined }))
      : results.map(r => r.markdown).join('\n\n---\n\n');
  }
}
