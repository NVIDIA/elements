import { data } from '../internal/data.js';
import {
  getLatestPublishedVersions,
  getAvailableElementsAPIs,
  searchElementsAPIsJSON,
  getElementAPIsMarkdown,
  searchChangelogs,
  searchChangelogsMarkdown,
  type ElementVersions
} from './utils.js';
import { service, tool } from '../internal/tools.js';

const packageNames = Object.keys(data.projects).filter(p => data.projects[p].changelog);

@service()
export class ApiService {
  @tool({
    description: 'Get list of all available APIs and components.'
  })
  static async available(): Promise<{ name: string; description: string; usage?: string }[]> {
    return getAvailableElementsAPIs(data);
  }

  @tool({
    description: 'Get API information for specific APIs and components',
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
      required: ['query']
    }
  })
  static async search({ query, format }: { query: string; format: 'markdown' | 'json' }) {
    return format === 'markdown' ? getElementAPIsMarkdown(query, data) : searchElementsAPIsJSON(query, data);
  }

  @tool({
    description: 'Get the changelog details for the @nve packages',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Available packages: ${packageNames.map(p => `\`${p}\``).join(' | ')}`,
          enum: packageNames
        },
        format: {
          type: 'string',
          description: 'Format of the output. `markdown` | `json`',
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['name']
    }
  })
  static async changelog({ name, format }: { name: string; format: 'markdown' | 'json' }): Promise<string> {
    const changelogs = await searchChangelogs(name, data);
    return format === 'markdown'
      ? searchChangelogsMarkdown(name, data).split('\n').slice(0, 512).join('\n')
      : JSON.stringify(changelogs, null, 2);
  }

  @tool({ description: 'Get the latest published versions of elements / @nve packages' })
  static async version(): Promise<ElementVersions> {
    return await getLatestPublishedVersions(data);
  }
}
