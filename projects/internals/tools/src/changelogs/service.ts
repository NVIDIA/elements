import { ProjectsService } from '@internals/metadata';
import { fuzzyMatch } from '../internal/search.js';
import { service, tool } from '../internal/tools.js';

const MAX_LINE_COUNT = 1024;
const projects = (await ProjectsService.getData()).data.filter(p => p.changelog);
const packageNames = projects.map(p => p.name);
const changelogs = projects.reduce((acc, p) => ({ ...acc, [p.name]: p.changelog }), {});

@service()
export class ChangelogsService {
  @tool({
    description: 'Get changelog details for all @nve packages.',
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
          type: 'object',
          patternProperties: {
            '^.*$': { type: 'string' }
          },
          additionalProperties: false
        }
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<{ [key: string]: string } | string> {
    const maxLength = MAX_LINE_COUNT / Object.keys(projects).length;
    const markdown = Object.entries(changelogs)
      .map(([key, value]: [string, string]) => `# ${key}\n\n${value.split('\n').slice(0, maxLength).join('\n')}`)
      .join('\n\n---\n\n');
    return format && format !== 'markdown' ? changelogs : markdown;
  }

  @tool({
    description: 'Get changelog details for specific @nve package.',
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
          description: 'Format of the output contents. `markdown` | `json`',
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['name']
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          patternProperties: {
            '^.*$': { type: 'string' }
          },
          additionalProperties: false
        }
      ],
      additionalProperties: false
    }
  })
  static async search({
    name,
    format
  }: {
    name: string;
    format?: 'markdown' | 'json';
  }): Promise<{ [key: string]: string } | string> {
    const changelog = await searchChangelogs(name, changelogs);
    const markdown = changelog.split('\n').slice(0, MAX_LINE_COUNT).join('\n');
    return format && format !== 'markdown' ? { [name]: changelog } : markdown;
  }
}

export function searchChangelogs(query: string, changelogs: { [key: string]: string }) {
  const matches = fuzzyMatch(query, Object.keys(changelogs));
  return changelogs[matches[0]];
}
