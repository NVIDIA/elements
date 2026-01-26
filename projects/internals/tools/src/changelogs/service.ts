import { ProjectsService } from '@nve-internals/metadata';
import { fuzzyMatch } from '../internal/search.js';
import { service, tool } from '../internal/tools.js';

const MAX_LINE_COUNT = 512;
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
    const changelog = searchChangelogs(name, changelogs);

    if (!changelog) {
      const availablePackages = packageNames.map(p => `"${p}"`).join(', ');
      const message = `No changelog found for "${name}".\n\nAvailable packages: ${availablePackages}\n\nTip: Try using the exact package name from the list above, or search for keywords like "elements", "themes", "cli", "monaco".`;
      return format && format !== 'markdown' ? { [name]: message } : message;
    }

    const markdown = changelog.split('\n').slice(0, MAX_LINE_COUNT).join('\n');
    return format && format !== 'markdown' ? { [name]: changelog } : markdown;
  }
}

export function searchChangelogs(query: string, changelogs: { [key: string]: string }) {
  const matches = fuzzyMatch(query, Object.keys(changelogs));
  return changelogs[matches[0]];
}
