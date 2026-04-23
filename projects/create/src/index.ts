#!/usr/bin/env node

// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';

const banner = `"░██████████ ░██                                                     ░██               \\n░██         ░██                                                     ░██               \\n░██         ░██  ░███████  ░█████████████   ░███████  ░████████  ░████████  ░███████  \\n░█████████  ░██ ░██    ░██ ░██   ░██   ░██ ░██    ░██ ░██    ░██    ░██    ░██        \\n░██         ░██ ░█████████ ░██   ░██   ░██ ░█████████ ░██    ░██    ░██     ░███████  \\n░██         ░██ ░██        ░██   ░██   ░██ ░██        ░██    ░██    ░██           ░██ \\n░██████████ ░██  ░███████  ░██   ░██   ░██  ░███████  ░██    ░██     ░████  ░███████"`;
const greeting = `\x1b[32m\x1b[?7l\n${JSON.parse(banner)}\n\n\x1b[0m`;

export async function main() {
  console.log(`${greeting}Starting up Elements CLI...\n`);
  const [command, args] = getCommand();
  spawn(command, args, { stdio: 'inherit' }).on('close', code => process.exit(code ?? 0));
}

function getCommand(): [string, string[]] {
  const client = process.env.npm_config_user_agent ?? '';
  const args = ['--package=@nvidia-elements/cli@latest', '--', 'nve', 'project.create', '--start'];
  if (process.argv[2]) args.push(`--type=${process.argv[2]}`);
  if (client.startsWith('pnpm')) return ['pnpm', ['dlx', ...args]];
  if (client.startsWith('yarn')) return ['yarn', ['dlx', ...args]];
  return ['npm', ['exec', '-y', ...args]];
}

void main();
