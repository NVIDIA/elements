import { ApiService } from '@nve-internals/metadata';
import { service, tool } from '../internal/tools.js';
import { getSemanticTokens } from './utils.js';
import { markdownDescription } from '../internal/utils.js';

@service()
export class TokensService {
  @tool({
    description: 'Get available semantic CSS variables / design tokens for theming.',
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
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'string' },
              description: { type: 'string' }
            },
            additionalProperties: false
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<{ name: string; description: string }[] | string> {
    const apis = await ApiService.getData();
    return getSemanticTokens(format, apis.data.tokens);
  }
}
