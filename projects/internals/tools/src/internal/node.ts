// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

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
