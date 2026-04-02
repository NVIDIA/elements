// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiService } from '@internals/metadata';
import type { TemplateLintMessage } from '@nvidia-elements/lint/eslint/internals';
import {
  createPlaygroundURL,
  defaultTemplate,
  type PlaygroundType,
  playgroundTypes,
  resolveTemplate
} from './utils.js';
import { service, tool } from '../internal/tools.js';
import { ELEMENTS_ENV_ICON } from '../internal/utils.js';
import { eslintSchema } from '../internal/schema.js';

export interface PlaygroundOptions {
  template?: string;
  path?: string;
  type?: PlaygroundType;
  name?: string;
  start?: boolean;
}

@service()
export class PlaygroundService {
  @tool({
    summary: 'Validates HTML templates specifically for playground examples.',
    description:
      'Validates HTML templates specifically for playground examples. Includes all checks from the "api_template_validate" tool with additional constraints to prevent common mistakes when generating standalone demos and playgrounds. Use this before calling playground_create.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description:
            'HTML template for a playground example. Should not include <html> or <body> tags. Must use only standard Elements patterns and components. Provide either "template" or "path", not both.'
        },
        path: {
          type: 'string',
          description: 'Absolute file path to an HTML template file. Provide either "template" or "path", not both.'
        }
      }
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
  static async validate({ template, path }: { template?: string; path?: string }): Promise<TemplateLintMessage[]> {
    const templateContent = await resolveTemplate({ template, path });

    if (process.env.ELEMENTS_ENV === 'mcp' || process.env.ELEMENTS_ENV === 'cli') {
      const { lintPlaygroundTemplate } = await import('@nvidia-elements/lint/eslint/internals');
      return await lintPlaygroundTemplate(templateContent);
    } else {
      return [];
    }
  }

  @tool({
    summary: 'Create a shareable playground URL from an HTML template.',
    description:
      'Create a shareable playground URL from an HTML template. Returns URL if valid, or validation errors if invalid. Tip: Use playground_validate first to check for issues.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description:
            'HTML template/snippet. Do NOT include `html`, `body` tags. Must use valid NVE Elements components and pass validation to receive a playground URL. Provide either "template" or "path", not both.',
          defaultTemplate
        },
        path: {
          type: 'string',
          description: 'Absolute file path to an HTML template file. Provide either "template" or "path", not both.'
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
        }
      }
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
    path,
    name,
    type,
    author
  }: PlaygroundOptions & { author?: string }): Promise<string | TemplateLintMessage[]> {
    const templateContent = await resolveTemplate({ template, path });

    if (process.env.ELEMENTS_ENV === 'mcp' || process.env.ELEMENTS_ENV === 'cli') {
      const { lintPlaygroundTemplate } = await import('@nvidia-elements/lint/eslint/internals');
      const lintResult = await lintPlaygroundTemplate(templateContent);

      if (lintResult.length > 0) {
        return lintResult;
      }
    }

    const apis = await ApiService.getData();
    const environment = process.env.ELEMENTS_ENV
      ? ELEMENTS_ENV_ICON[process.env.ELEMENTS_ENV as keyof typeof ELEMENTS_ENV_ICON]
      : undefined;
    const formattedName = `${name}${author ? ` - (${author})` : ''}${environment ? ` ${environment}` : ''}`;
    const result = createPlaygroundURL(templateContent, apis.data.elements, { name: formattedName, type });

    if (!process.env.CI && (process.env.ELEMENTS_ENV === 'mcp' || process.env.ELEMENTS_ENV === 'cli')) {
      const openBrowser = await import('open');
      void openBrowser.default(result);
    }

    return result;
  }
}
