// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import nodePath from 'node:path';
import { service, tool, ToolSupport } from '../internal/tools.js';
import { elementsSkill } from './registry.js';
import { writeSkillDirectory } from './utils.js';

interface SkillInstallOptions {
  global?: boolean;
}

interface SkillInstallEnvironment extends SkillInstallOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
}

export function getSkillInstallDirectories({
  global = false,
  cwd = process.cwd(),
  env = process.env,
  platform = process.platform
}: SkillInstallEnvironment = {}): string[] {
  if (!global) {
    return [
      nodePath.resolve(cwd, '.agents', 'skills', elementsSkill.name),
      nodePath.resolve(cwd, '.claude', 'skills', elementsSkill.name)
    ];
  }

  const home = platform === 'win32' ? env.USERPROFILE : env.HOME;
  if (!home) {
    throw new Error('Could not install Elements agent skill. HOME is not set.');
  }
  const path = platform === 'win32' ? nodePath.win32 : nodePath;
  return [path.join(home, '.agents', 'skills', elementsSkill.name)];
}

@service()
export class SkillsService {
  @tool({
    summary: 'Install the Elements agent skill.',
    description:
      'Install the Elements agent skill in the current project, or use --global to install it for the current user.',
    support: ToolSupport.CLI,
    inputSchema: {
      type: 'object',
      properties: {
        global: {
          type: 'boolean',
          description: 'Install the skill for the current user instead of the current project.',
          default: false
        }
      },
      additionalProperties: false
    },
    outputSchema: { type: 'string' },
    cli: { positionals: {} }
  })
  static async install(options: SkillInstallOptions = {}): Promise<string> {
    const directories = getSkillInstallDirectories(options);
    await Promise.all(directories.map(directory => writeSkillDirectory(directory, elementsSkill)));
    return `Installed Elements agent skill:\n${directories.map(directory => `- ${directory}`).join('\n')}`;
  }
}
