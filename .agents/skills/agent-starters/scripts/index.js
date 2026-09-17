#!/usr/bin/env node

// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { realpathSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createToolBin, shellQuote } from './environment.js';
import { installProductionCli, toolVersions } from './install.js';
import { compareInventory, runStarterPlans, STARTERS, verifyStarter } from './verify.js';

export {
  applyReleaseAgeOverride,
  assertCacheDirectoriesEmpty,
  createIsolatedEnvironment,
  runCommand
} from './environment.js';
export {
  compareInventory,
  evaluateCreation,
  finalizeProject,
  runStarterPlans,
  STARTERS,
  verificationScript
} from './verify.js';

function now() {
  return new Date().toISOString();
}

export function createProgressReporter({ clock = Date.now, stream = process.stderr } = {}) {
  return message => stream.write(`${new Date(clock()).toISOString()} [agent-starters] ${message}\n`);
}

function canonicalizePath(targetPath) {
  let existingPath = path.resolve(targetPath);
  const missingSegments = [];

  while (true) {
    try {
      return path.join(realpathSync(existingPath), ...missingSegments);
    } catch (error) {
      if (error.code !== 'ENOENT' || existingPath === path.parse(existingPath).root) throw error;
      missingSegments.unshift(path.basename(existingPath));
      existingPath = path.dirname(existingPath);
    }
  }
}

export function isUnsafeRunDirectory(runDirectory, repositoryRoot) {
  const resolvedRunDirectory = canonicalizePath(runDirectory);
  const resolvedRepositoryRoot = canonicalizePath(repositoryRoot);
  return (
    resolvedRunDirectory === path.parse(resolvedRunDirectory).root ||
    resolvedRunDirectory === resolvedRepositoryRoot ||
    resolvedRunDirectory.startsWith(`${resolvedRepositoryRoot}${path.sep}`)
  );
}

export function formatSummary(report) {
  const lines = [
    `Production starter verification: ${report.status.toUpperCase()}`,
    `CLI: ${report.cli ? `${report.cli.version} (${report.cli.installUrl})` : 'installation incomplete'}`,
    `Package manager: pnpm ${report.toolchain.pnpm ?? 'unavailable'}`,
    `Package manager configuration: minimumReleaseAge=${report.packageManagerConfiguration.minimumReleaseAge}`,
    `Run: ${report.runRoot}`
  ];
  if (report.failure) lines.push(`FAIL harness (${report.failure.phase}: ${report.failure.error})`);
  if (report.inventory.error) lines.push(`FAIL inventory (${report.inventory.error})`);
  for (const result of report.starters) {
    const details = [result.failingPhase, result.error].filter(Boolean).join(': ');
    lines.push(`${result.status === 'pass' ? 'PASS' : 'FAIL'} ${result.name}${details ? ` (${details})` : ''}`);
  }
  lines.push(`JSON: ${path.join(report.runRoot, 'results.json')}`);
  lines.push(`Cleanup: node ${shellQuote(fileURLToPath(import.meta.url))} --cleanup ${shellQuote(report.runRoot)}`);
  return lines.join('\n');
}

async function runVerification(options = {}) {
  const runRoot = options.runRoot ?? (await mkdtemp(path.join(os.tmpdir(), 'nvidia-elements-agent-starters-')));
  const progress = options.progress ?? createProgressReporter();
  const repositoryRoot = await realpath(path.resolve(fileURLToPath(import.meta.url), '../../../../..'));
  if (isUnsafeRunDirectory(runRoot, repositoryRoot)) {
    throw new Error('Verification output must be outside the repository checkout.');
  }
  const configured = STARTERS;
  const report = {
    cli: null,
    finishedAt: null,
    inventory: { configured, discovered: [] },
    packageManager: 'pnpm',
    packageManagerConfiguration: {
      minimumReleaseAge: 0,
      reason: 'Verify newly published Elements releases without pnpm release-age quarantine.'
    },
    runRoot,
    startedAt: now(),
    starters: [],
    status: 'fail',
    toolchain: {}
  };
  progress(`run started; evidence directory: ${runRoot}`);
  progress('package manager: minimumReleaseAge=0 to include newly published Elements releases');
  let phase = 'toolchain';
  try {
    progress('toolchain: creating isolated command environment');
    const toolBin = await createToolBin(runRoot);
    report.toolchain = await toolVersions(toolBin);
    progress(
      `toolchain: pnpm ${report.toolchain.pnpm ?? 'unavailable'}, Node.js ${report.toolchain.node ?? 'unavailable'}`
    );
    phase = 'cli-install';
    progress('CLI: installing current stable production release');
    const cli = await installProductionCli(runRoot, toolBin, progress);
    report.cli = cli.provenance;
    progress(`CLI: installed version ${report.cli.version}`);
    phase = 'inventory';
    const inventory = compareInventory(cli.inventory);
    report.inventory = { configured, discovered: cli.inventory, ...inventory };
    progress(`inventory: discovered ${cli.inventory.length} starters`);
    if (!inventory.ok) {
      report.inventory.error = 'Production starter inventory does not match the verification configuration.';
      progress('inventory: FAIL; production inventory does not match verification configuration');
    } else {
      phase = 'starters';
      report.starters = await runStarterPlans(
        cli.inventory.map(name => ({ cli, name, progress, runRoot, toolBin })),
        verifyStarter
      );
      report.status = report.starters.every(result => result.status === 'pass') ? 'pass' : 'fail';
    }
  } catch (error) {
    report.failure = { error: error.message, phase };
    progress(`harness: FAIL during ${phase} (${error.message})`);
  } finally {
    report.finishedAt = now();
  }
  await writeFile(path.join(runRoot, 'results.json'), `${JSON.stringify(report, null, 2)}\n`);
  const summary = formatSummary(report);
  await writeFile(path.join(runRoot, 'summary.txt'), `${summary}\n`);
  progress(`run finished with status ${report.status.toUpperCase()}; results: ${path.join(runRoot, 'results.json')}`);
  return { report, summary };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--output-dir') {
      const value = argv[++index];
      if (!value || value.startsWith('-')) throw new Error('--output-dir requires a path.');
      options.runRoot = path.resolve(value);
    } else if (arg === '--cleanup') {
      const value = argv[++index];
      if (!value || value.startsWith('-')) throw new Error('--cleanup requires a path.');
      options.cleanup = path.resolve(value);
    } else if (arg === '--help') options.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

function usage() {
  return `Usage: node .agents/skills/agent-starters/scripts/index.js [options]

Options:
  --json                 Print structured JSON instead of the concise summary.
  --output-dir <path>    Use a new, empty output directory outside the checkout.
  --cleanup <run-dir>    Remove one retained verification run explicitly.
  --help                 Show this help.`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return console.log(usage());
  if (options.cleanup) {
    const cleanup = canonicalizePath(options.cleanup);
    const marker = JSON.parse(await readFile(path.join(cleanup, 'results.json'), 'utf8'));
    if (typeof marker.runRoot !== 'string' || canonicalizePath(marker.runRoot) !== cleanup) {
      throw new Error('Refusing cleanup: invalid run marker.');
    }
    const repositoryRoot = await realpath(path.resolve(fileURLToPath(import.meta.url), '../../../../..'));
    if (isUnsafeRunDirectory(cleanup, repositoryRoot)) {
      throw new Error('Refusing cleanup: unsafe run directory.');
    }
    await rm(cleanup, { recursive: true, force: true });
    return console.log(`Removed ${cleanup}`);
  }
  if (options.runRoot) {
    const repositoryRoot = await realpath(path.resolve(fileURLToPath(import.meta.url), '../../../../..'));
    if (isUnsafeRunDirectory(options.runRoot, repositoryRoot)) {
      throw new Error('Verification output must be outside the repository checkout.');
    }
    await mkdir(options.runRoot, { recursive: false });
    if ((await readdir(options.runRoot)).length) throw new Error('--output-dir must be new and empty.');
  }
  const { report, summary } = await runVerification(options);
  console.log(options.json ? JSON.stringify(report, null, 2) : summary);
  process.exitCode = report.status === 'pass' ? 0 : 1;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch(error => {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  });
}
