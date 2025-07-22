import { MetadataService, type MetadataStory } from '@internals/metadata';
import { service, tool } from '../internal/tools.js';
import { getExampleStoriesMarkdown, searchExampleStories } from './utils.js';

@service()
export class ExampleService {
  private static _examples: MetadataStory[] = [];

  @tool({
    description: 'Get list of available examples.'
  })
  static async available(): Promise<MetadataStory[]> {
    if (ExampleService._examples.length === 0) {
      ExampleService._examples = (await MetadataService.getStories())?.map(s => {
        s.template = 'get full template via example_search';
        return s;
      });
    }
    return ExampleService._examples;
  }

  @tool({
    description: 'Search for template examples by name or description.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The query to search for' },
        format: {
          type: 'string',
          description: 'Format of the output. `markdown` | `json`',
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['query']
    }
  })
  static async search({
    query,
    format = 'markdown'
  }: {
    query: string;
    format?: 'markdown' | 'json';
  }): Promise<MetadataStory[] | string> {
    const json = await searchExampleStories(query);
    return format === 'markdown' ? getExampleStoriesMarkdown(json) : json;
  }

  static async getAll(): Promise<MetadataStory[]> {
    return MetadataService.getStories();
  }
}
