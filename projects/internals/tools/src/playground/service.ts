import { ApiService } from '@nve-internals/metadata';
import type { TemplateLintMessage } from '@nvidia-elements/lint/eslint/internals';
import { createPlaygroundURL, type PlaygroundType, playgroundTypes } from './utils.js';
import { service, tool } from '../internal/tools.js';
import { ELEMENTS_ENV_ICON } from '../internal/utils.js';
import { eslintSchema } from '../internal/schema.js';

export interface PlaygroundOptions {
  template: string;
  type?: PlaygroundType;
  name?: string;
  start?: boolean;
}

const defaultTemplate =
  '<nve-page>\n  <nve-page-header slot="header">\n    <nve-logo slot="prefix" size="sm"></nve-logo>\n    <h2 slot="prefix">NVIDIA</h2>\n  </nve-page-header>\n  <main nve-layout="column gap:lg pad:lg">\n    <!-- template content here -->\n  </main>\n</nve-page>';

@service()
export class PlaygroundService {
  @tool({
    description:
      'Validates HTML templates for playground examples. Enforces additional constraints to prevent common mistakes when generating standalone demos. Use this before calling playground_create.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description:
            'HTML template for a playground example. Should not include <html> or <body> tags. Must use only standard Elements patterns and components.'
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
  static async validate({ template }: { template: string }): Promise<TemplateLintMessage[]> {
    if (process.env.ELEMENTS_ENV === 'mcp' || process.env.ELEMENTS_ENV === 'cli') {
      const { lintPlaygroundTemplate } = await import('@nvidia-elements/lint/eslint/internals');
      return await lintPlaygroundTemplate(template);
    } else {
      return [];
    }
  }

  @tool({
    description:
      'Create a shareable playground URL from an HTML template. Returns URL if valid, or validation errors if invalid. Tip: Use playground_validate first to check for issues.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description:
            'HTML template/snippet. Do NOT include `html`, `body` tags. Must use valid NVE Elements components and pass validation to receive a playground URL.',
          defaultTemplate
        },
        type: {
          type: 'string',
          description: `Type of the playground. ${playgroundTypes.map(type => `\`${type}\``).join('| ')}`,
          enum: [...playgroundTypes],
          enumNames: playgroundTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
          default: 'default'
        },
        name: {
          type: 'string',
          description: 'Name of the playground',
          default: 'Playground Project'
        },
        author: {
          type: 'string',
          description: 'Name of the author or LLM model that created the playground.',
          default: ''
        },
        start: {
          type: 'boolean',
          description:
            'Open the playground url in browser after creation. Note: URL is returned regardless of this setting when template is valid.',
          default: false
        }
      },
      required: ['template']
    },
    outputSchema: {
      oneOf: [
        { type: 'string', description: 'Returns a playground URL when template is valid.' },
        {
          type: 'array',
          items: eslintSchema,
          description: 'Template errors requiring correction.',
          additionalProperties: false
        }
      ]
    }
  })
  static async create({
    template,
    name,
    type,
    start,
    author
  }: PlaygroundOptions & { author?: string }): Promise<string | TemplateLintMessage[]> {
    if (process.env.ELEMENTS_ENV === 'mcp' || process.env.ELEMENTS_ENV === 'cli') {
      const { lintPlaygroundTemplate } = await import('@nvidia-elements/lint/eslint/internals');
      const lintResult = await lintPlaygroundTemplate(template);

      if (lintResult.length > 0) {
        return lintResult;
      }
    }

    const apis = await ApiService.getData();
    const environment = ELEMENTS_ENV_ICON[process.env.ELEMENTS_ENV];
    const formattedName = `${name}${author ? ` - (${author})` : ''}${environment ? ` ${environment}` : ''}`;
    const result = createPlaygroundURL(template, apis.data.elements, { name: formattedName, type });

    if (!process.env.CI && (process.env.ELEMENTS_ENV === 'mcp' || (process.env.ELEMENTS_ENV === 'cli' && start))) {
      const openBrowser = await import('open');
      void openBrowser.default(result);
    }

    return result;
  }
}
