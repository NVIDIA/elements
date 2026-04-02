// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ProjectsService } from '@internals/metadata';
import type { ElementVersions } from '../api/utils.js';
import { service, tool } from '../internal/tools.js';
import { markdownDescription } from '../internal/utils.js';
import { getAvailablePackages, getPackage, getVersions, limitChangelogVersions, searchChangelogs } from './utils.js';

const MAX_LINE_COUNT = 512;
const projects = (await ProjectsService.getData()).data.filter((p: { changelog: string }) => p.changelog);
const packageNames = projects.map((p: { name: string }) => p.name);
const changelogs: Record<string, string> = projects.reduce(
  (acc: Record<string, string>, p: { name: string; changelog: string }) => ({ ...acc, [p.name]: p.changelog ?? '' }),
  {}
);

@service()
export class PackagesService {
  static async versions(): Promise<ElementVersions> {
    return await getVersions();
  }

  @tool({
    summary: 'Get latest published versions of all Elements packages.',
    outputSchema: { type: 'string' }
  })
  static async list(): Promise<string> {
    return await getAvailablePackages();
  }

  @tool({
    summary: 'Get details for a specific Elements package.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Available packages.`
        }
      },
      required: ['name']
    },
    outputSchema: { type: 'string' }
  })
  static async get({ name }: { name: string }): Promise<string> {
    return await getPackage(name);
  }

  @tool({
    summary: 'Retrieve changelog details by package name.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Available package changelogs.`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        },
        limit: {
          type: 'number',
          description: 'Max number of versions to return.',
          default: 10
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
  static async changelogsGet({
    name,
    format,
    limit = 10
  }: {
    name: string;
    format?: 'markdown' | 'json';
    limit?: number;
  }): Promise<{ [key: string]: string } | string> {
    const changelog = searchChangelogs(name, changelogs);

    if (!changelog) {
      const availablePackages = packageNames.map((p: string) => `"${p}"`).join(', ');
      const message = `No changelog found for "${name}".\n\nAvailable packages: ${availablePackages}`;
      return format && format !== 'markdown' ? { [name]: message } : message;
    }

    const limited = limitChangelogVersions(changelog, limit);
    const markdown = limited.split('\n').slice(0, MAX_LINE_COUNT).join('\n');
    return format && format !== 'markdown' ? { [name]: limited } : markdown;
  }
}
