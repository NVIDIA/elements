import { MetadataService } from '@nve-internals/metadata';
import { createPlaygroundURL, type PlaygroundType, playgroundTypes } from './utils.js';
import { service, tool } from '../internal/tools.js';
import { validateTemplate } from '../internal/validate.js';
import { ELEMENTS_ENV_ICON } from '../internal/utils.js';

export interface PlaygroundOptions {
  template: string;
  type?: PlaygroundType;
  name?: string;
  start?: boolean;
}

@service()
export class PlaygroundService {
  @tool({
    description: 'Get validated HTML string for an example template/playground.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description: 'HTML template/snippet to be validated and formatted.'
        }
      },
      required: ['template']
    },
    outputSchema: {
      type: 'string',
      description: 'Validated HTML string.'
    }
  })
  static async validate({ template }: { template: string }): Promise<string> {
    const metadata = await MetadataService.getMetadata();
    return validateTemplate(template, metadata, { allowGlobalElements: false });
  }

  @tool({
    description: 'Creates a playground url/link generated from a html template string.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description: 'HTML template/snippet. Do NOT include `html`, `body` tags.',
          defaultTemplate: `<nve-page>\n  <nve-page-header slot="header">\n    <nve-logo slot="prefix" size="sm"></nve-logo>\n    <h2 slot="prefix">NVIDIA</h2>\n  </nve-page-header>\n  <main nve-layout="column gap:lg pad:lg">\n    <!-- template content here -->\n  </main>\n</nve-page>`,
          defaultTemplatePostfix: '.html'
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
          description: 'Open the playground url in browser after creation.',
          default: false
        }
      },
      required: ['template']
    },
    outputSchema: {
      type: 'string',
      description: 'Returns a playground url/link generated from a html string.'
    }
  })
  static async create({
    template,
    name,
    type,
    start,
    author
  }: PlaygroundOptions & { author?: string }): Promise<string> {
    const metadata = await MetadataService.getMetadata();
    const environment = ELEMENTS_ENV_ICON[process.env.ELEMENTS_ENV];
    const formattedName = `${name}${author ? ` - (${author})` : ''}${environment ? ` ${environment}` : ''}`;
    const result = createPlaygroundURL(template, metadata, { name: formattedName, type });

    if (start && !globalThis.document) {
      const openBrowser = await import('open');
      void openBrowser.default(result);
    }

    return result;
  }
}
