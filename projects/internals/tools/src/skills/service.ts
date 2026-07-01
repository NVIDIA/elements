// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { service, tool } from '../internal/tools.js';
import { markdownDescription } from '../internal/utils.js';
import { skills, type Skill } from './registry.js';
import { formatSkillMarkdown } from './utils.js';

type OutputFormat = 'markdown' | 'json';

export type SkillListItem = Pick<Skill, 'name' | 'title' | 'description'>;

const skillNames = skills.map(skill => `\`${skill.name}\``).join(', ');

@service()
export class SkillsService {
  @tool({
    summary: 'Get a list of available Elements agent skills and context.',
    description:
      'Get a list of bundled Elements agent skills and context that can be used even when skills are not installed on disk.',
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
              title: { type: 'string' },
              description: { type: 'string' }
            },
            additionalProperties: false,
            required: ['name', 'title', 'description']
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async list({ format = 'markdown' }: { format?: OutputFormat } = {}): Promise<SkillListItem[] | string> {
    return format === 'json'
      ? skills.map(({ name, title, description }) => ({ name, title, description }))
      : skills.map(skill => `\`${skill.name}\`: ${skill.description}`).join('\n\n');
  }

  @tool({
    summary: 'Get a bundled Elements agent skill by name.',
    description:
      'Get a bundled Elements agent skill by name. Use this when a skill is not installed on disk or the agent needs focused Elements workflow guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `The skill name to retrieve. Available names: ${skillNames}`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['name'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            context: { type: 'string' }
          },
          additionalProperties: false,
          required: ['name', 'title', 'description', 'context']
        }
      ],
      additionalProperties: false
    }
  })
  static async get({ name, format = 'markdown' }: { name: string; format?: OutputFormat }): Promise<Skill | string> {
    const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase());

    if (!skill) {
      throw new Error(`Unknown skill "${name}".\n\nAvailable skills: ${skillNames}`);
    }

    return format === 'json' ? skill : formatSkillMarkdown(skill);
  }
}
