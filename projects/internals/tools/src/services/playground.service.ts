import { data } from './data.js';
import { createPlaygroundURL, type PlaygroundType, playgroundTypes } from '../utils/playground.js';
import { service, tool } from '../utils/tools.js';
import { validateTemplate } from '../utils/validate.js';

@service()
export class PlaygroundService {
  @tool({
    description: 'Get validated/sanitized HTML string for an example template/playground.',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'HTML to be validated, sanitized and formatted.'
        }
      },
      required: ['html']
    }
  })
  static async validateTemplate({
    html
  }: {
    html: string;
  }): Promise<{ result: string; status: 'success' | 'error'; message?: string }> {
    return validateTemplate(html, data, { allowGlobalElements: false });
  }

  @tool({
    description: 'Create a playground url/link from a html string',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'HTML to be embedded in a playground page. Do NOT include `html`, `body` tags or custom CSS.'
        },
        type: {
          type: 'string',
          description: `Type of the playground. ${playgroundTypes.map(type => `\`${type}\``).join('| ')}`,
          enum: [...playgroundTypes],
          enumNames: playgroundTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1))
        },
        name: {
          type: 'string',
          description: 'Name of the playground'
        },
        start: {
          type: 'boolean',
          description: 'Open the playground url in browser after creation.',
          default: false
        }
      },
      required: ['html']
    }
  })
  static async create({
    html,
    name,
    type,
    start
  }: {
    html: string;
    type?: PlaygroundType;
    name?: string;
    start?: boolean;
  }): Promise<string> {
    const result = createPlaygroundURL(html, data, { name, type });

    if (start && !globalThis.document) {
      const openBrowser = await import('open');
      void openBrowser.default(result);
    }

    return result;
  }
}
