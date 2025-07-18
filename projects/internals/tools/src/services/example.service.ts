import { data } from './data.js';
import { service, tool } from '../utils/tools.js';
import {
  getAllExampleStories,
  getExampleStoriesMarkdown,
  searchExampleStories,
  type StoryExample
} from '../utils/example.js';

@service()
export class ExampleService {
  @tool({
    description: 'Get list of available examples.'
  })
  static async available(): Promise<StoryExample[]> {
    const results = await getAllExampleStories(data);
    return results.map(s => {
      s.template = 'get full template via example_search';
      return s;
    });
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
  }): Promise<StoryExample[] | string> {
    const json = await searchExampleStories(query, data);
    return format === 'markdown' ? getExampleStoriesMarkdown(json) : json;
  }

  static async getAll(): Promise<StoryExample[]> {
    return getAllExampleStories(data);
  }
}
