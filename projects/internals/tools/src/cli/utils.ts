// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn, execSync } from 'node:child_process';
import type { Report } from '../internal/types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

export type ProgressCallback = (message: string) => void;

export const upgradeCommands = {
  'macos/linux': `curl -fsSL ${__ELEMENTS_PAGES_BASE_URL__}/install.sh | bash`,
  'windows-cmd': `curl -fsSL ${__ELEMENTS_PAGES_BASE_URL__}/install.cmd -o install.cmd && install.cmd && del install.cmd`,
  nodejs: 'npm install -g @nvidia-elements/cli'
};

/**
 * With an onProgress callback, spawns async with piped stdio so the caller
 * can stream output (used by MCP to send progress notifications).
 * Without onProgress, uses execSync with inherited stdio so the install
 * script sees a real TTY and preserves colors (used by CLI).
 */
export async function performUpgrade(onProgress?: ProgressCallback): Promise<Report> {
  const command = process.platform === 'win32' ? upgradeCommands['windows-cmd'] : upgradeCommands['macos/linux'];

  if (onProgress) {
    return runAsync(command, onProgress);
  }
  return runSync(command);
}

function runSync(command: string): Report {
  try {
    execSync(command, { stdio: 'inherit' });
    return { upgrade: { message: 'CLI upgraded successfully.', status: 'success' } };
  } catch (e) {
    return { upgrade: { message: (e as Error).message, status: 'danger' } };
  }
}

async function runAsync(command: string, onProgress: ProgressCallback): Promise<Report> {
  const shell = process.platform === 'win32' ? 'cmd' : 'bash';
  const shellFlag = process.platform === 'win32' ? '/c' : '-c';

  try {
    const output = await new Promise<string>((resolve, reject) => {
      const child = spawn(shell, [shellFlag, command], { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        onProgress(chunk.trim());
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', code => {
        if (code !== 0) {
          reject(new Error(stderr || `Process exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });

      child.on('error', err => {
        reject(err);
      });
    });
    return {
      upgrade: { message: output || 'CLI upgraded successfully.', status: 'success' }
    };
  } catch (e) {
    return {
      upgrade: { message: (e as Error).message, status: 'danger' }
    };
  }
}
