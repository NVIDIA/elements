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
    inputSchema: {},
    outputSchema: { type: 'string' }
  })
  static async list(): Promise<string> {
    const examples = await ExamplesServiceMetadata.getData();
    return getPublicExamples('markdown', examples) as string;
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
        }
      },
      required: ['query']
    },
    outputSchema: { type: 'string' }
  })
  static async search({ query }: { query: string }): Promise<string> {
    return (await searchPublicExamples(query, { format: 'markdown', limit: MAX_RESULT_LIMIT })) as string;
  }

  static async getAll(): Promise<Example[]> {
    return ExamplesServiceMetadata.getData();
  }
}
