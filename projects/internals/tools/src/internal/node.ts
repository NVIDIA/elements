// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';
import { accessSync, constants, existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';

interface FindExecutablesOptions {
  envPath?: string;
  platform?: NodeJS.Platform;
  pathExt?: string;
}

export async function getNPMClient() {
  const hasNPM = await isCommandAvailable('npm');
  const hasPNPM = await isCommandAvailable('pnpm');
  return hasPNPM ? 'pnpm' : hasNPM ? 'npm' : null;
}

export async function isCommandAvailable(command: string) {
  return new Promise(resolve => {
    const child = spawn(command, ['--version']);
    child.on('error', () => resolve(false));
    child.on('close', code => resolve(code === 0));
  });
}

export function getPackageJson(cwd: string) {
  const packageJsonPath = resolve(join(cwd, 'package.json'));

  if (!existsSync(packageJsonPath)) {
    throw new Error('No package.json found in the project.');
  }

  return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
}

export function findExecutablesOnPath(command: string, options: FindExecutablesOptions = {}) {
  const envPath = options.envPath ?? process.env.PATH ?? '';
  const commandNames = getExecutableNames(command, options);
  const executables = new Map<string, string>();

  envPath
    .split(delimiter)
    .filter(Boolean)
    .forEach(directory => {
      commandNames.forEach(commandName => {
        const commandPath = resolve(directory, commandName);

        if (!existsSync(commandPath)) {
          return;
        }

        try {
          if (!isExecutableFile(commandPath, options.platform ?? process.platform)) {
            return;
          }

          const realpath = realpathSync(commandPath);
          if (!executables.has(realpath)) {
            executables.set(realpath, commandPath);
          }
        } catch {
          // Ignore PATH entries this process cannot inspect.
        }
      });
    });

  return [...executables.values()];
}

function getExecutableNames(command: string, options: FindExecutablesOptions) {
  if ((options.platform ?? process.platform) !== 'win32') {
    return [command];
  }

  const pathExt = options.pathExt ?? process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD;.PS1';
  const extensions = pathExt
    .split(';')
    .filter(Boolean)
    .map(extension => extension.toLowerCase());

  return [command, ...extensions.map(extension => `${command}${extension}`)];
}

function isExecutableFile(commandPath: string, platform: NodeJS.Platform) {
  if (!statSync(commandPath).isFile()) {
    return false;
  }

  if (platform === 'win32') {
    return true;
  }

  try {
    accessSync(commandPath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
