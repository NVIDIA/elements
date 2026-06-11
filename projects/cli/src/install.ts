// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { chmod, copyFile, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { accessSync, constants, createReadStream, createWriteStream, existsSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve, win32 } from 'node:path';
import { createInterface } from 'node:readline/promises';
import type { Readable, Writable } from 'node:stream';
import { formatSkillMarkdown, skills } from '@internals/tools/skills';
import { colors } from './utils.js';

interface InstallPaths {
  binDir: string;
  canonicalBinaryPath: string;
  convenienceShimPath?: string;
  manifestPath: string;
  root: string;
  windowsCommandShimPath?: string;
}

interface InstallManifest {
  canonicalBinaryPath: string;
  cliName: 'nve';
  installedAt: string;
  pathResolutionWorkedDuringInstall: boolean;
  platform: string;
  shimPaths: string[];
  version: string;
}

interface InstallContext {
  env: NodeJS.ProcessEnv;
  log: (message: string) => void;
  now: () => Date;
  paths: InstallPaths;
  platform: NodeJS.Platform;
  prompt: (question: string) => Promise<string | undefined>;
  source: string;
  warn: (message: string) => void;
}

interface InstallState {
  pathExecutable: string;
  restrictedPathExecutionWorked: boolean;
  shimPaths: string[];
  version: string;
}

interface InstallOptions {
  env?: NodeJS.ProcessEnv;
  log?: (message: string) => void;
  now?: () => Date;
  platform?: NodeJS.Platform;
  prompt?: (question: string) => Promise<string | undefined>;
  source?: string;
  warn?: (message: string) => void;
}

interface InstallResult extends InstallManifest {
  directCanonicalExecutionWorked: boolean;
  manifestPath: string;
  pathExecutable: string;
  restrictedPathExecutionWorked: boolean;
}

const UNIX_RESTRICTED_PATH = '/usr/bin:/bin:/usr/sbin:/sbin';

export async function installNve(options: InstallOptions = {}): Promise<InstallResult> {
  const context = createInstallContext(options);
  const state = await installExecutable(context);
  const manifest = createManifest(context, state);

  await installGlobalElementsSkill(context);
  await writeFile(context.paths.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  printInstallSummary(context, state.pathExecutable, state.restrictedPathExecutionWorked);

  return createInstallResult(context, manifest, state);
}

function createInstallContext(options: InstallOptions): InstallContext {
  const platform = options.platform ?? process.platform;
  const env = options.env ?? process.env;
  return {
    env,
    log: options.log ?? console.log,
    now: options.now ?? (() => new Date()),
    paths: getInstallPaths(env, platform),
    platform,
    prompt: options.prompt ?? (question => promptFromTerminal(question, platform)),
    source: resolve(options.source ?? process.execPath),
    warn: options.warn ?? console.warn
  };
}

async function installExecutable(context: InstallContext): Promise<InstallState> {
  await mkdir(context.paths.binDir, { recursive: true });
  await copyExecutable(context.source, context.paths.canonicalBinaryPath, context.platform);

  const version = verifyVersion(context.paths.canonicalBinaryPath, context.env, context.platform);
  const restrictedPathExecutionWorked = verifyRestrictedPath(context);
  const shimPaths = await setupPathIntegration(context);
  const pathExecutable = findExecutableOnPath('nve', context.env, context.platform) ?? '';

  return { pathExecutable, restrictedPathExecutionWorked, shimPaths, version };
}

function verifyRestrictedPath({ env, paths, platform }: InstallContext): boolean {
  if (platform === 'win32') {
    return true;
  }

  verifyVersion(paths.canonicalBinaryPath, { ...env, PATH: UNIX_RESTRICTED_PATH }, platform);
  return true;
}

async function setupPathIntegration(context: InstallContext): Promise<string[]> {
  const shimPaths = await setupPlatformShims(context);
  prependPathEntry(context.paths.binDir, context.env, context.platform);
  return shimPaths;
}

async function setupPlatformShims({ env, paths, platform, warn }: InstallContext): Promise<string[]> {
  if (platform === 'win32') {
    setupWindowsPath(paths.binDir, env, warn);
    return paths.windowsCommandShimPath ? [await createWindowsCommandShim(paths.windowsCommandShimPath)] : [];
  }

  const shimPath = await createUnixConvenienceShim(paths, env, warn);
  await setupUnixShellProfile(paths.binDir, env, warn);
  return shimPath ? [shimPath] : [];
}

function createManifest({ now, paths, platform }: InstallContext, state: InstallState): InstallManifest {
  return {
    cliName: 'nve',
    version: state.version,
    platform: getManifestPlatform(platform),
    canonicalBinaryPath: paths.canonicalBinaryPath,
    shimPaths: state.shimPaths,
    pathResolutionWorkedDuringInstall: state.pathExecutable !== '',
    installedAt: now().toISOString()
  };
}

function createInstallResult(context: InstallContext, manifest: InstallManifest, state: InstallState): InstallResult {
  return {
    ...manifest,
    directCanonicalExecutionWorked: true,
    manifestPath: context.paths.manifestPath,
    pathExecutable: state.pathExecutable,
    restrictedPathExecutionWorked: state.restrictedPathExecutionWorked
  };
}

export function getInstallPaths(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform
): InstallPaths {
  const path = platform === 'win32' ? win32 : { join };
  const root = getInstallRoot(env, platform);
  const binDir = path.join(root, 'bin');

  if (platform === 'win32') {
    return {
      root,
      binDir,
      canonicalBinaryPath: path.join(binDir, 'nve.exe'),
      manifestPath: path.join(root, 'manifest.json'),
      windowsCommandShimPath: path.join(binDir, 'nve.cmd')
    };
  }

  return {
    root,
    binDir,
    canonicalBinaryPath: path.join(binDir, 'nve'),
    convenienceShimPath: env.HOME ? path.join(env.HOME, '.local', 'bin', 'nve') : undefined,
    manifestPath: path.join(root, 'manifest.json')
  };
}

function getInstallRoot(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string {
  if (env.NVE_HOME) {
    return env.NVE_HOME;
  }

  if (platform === 'win32') {
    if (!env.LOCALAPPDATA) {
      throw new Error('LOCALAPPDATA is not set. Set NVE_HOME and retry.');
    }
    return win32.join(env.LOCALAPPDATA, 'nve');
  }

  if (!env.HOME) {
    throw new Error('HOME is not set. Set NVE_HOME and retry.');
  }
  return join(env.HOME, '.nve');
}

async function copyExecutable(source: string, destination: string, platform: NodeJS.Platform): Promise<void> {
  if (!isSamePath(source, destination)) {
    await copyFile(source, destination);
  }

  if (platform !== 'win32') {
    await chmod(destination, 0o755);
  }
}

function isSamePath(left: string, right: string): boolean {
  try {
    return realpathSync(left) === realpathSync(right);
  } catch {
    return false;
  }
}

async function createWindowsCommandShim(shimPath: string): Promise<string> {
  await writeFile(shimPath, '@echo off\r\n"%~dp0nve.exe" %*\r\n');
  return shimPath;
}

async function createUnixConvenienceShim(
  paths: InstallPaths,
  env: NodeJS.ProcessEnv,
  warn: (message: string) => void
): Promise<string | undefined> {
  if (!env.HOME || !paths.convenienceShimPath || paths.convenienceShimPath === paths.canonicalBinaryPath) {
    return undefined;
  }

  try {
    await mkdir(dirname(paths.convenienceShimPath), { recursive: true });
    await rm(paths.convenienceShimPath, { force: true });
    await symlink(paths.canonicalBinaryPath, paths.convenienceShimPath);
    return paths.convenienceShimPath;
  } catch {
    try {
      await writeFile(paths.convenienceShimPath, `#!/bin/sh\nexec "${paths.canonicalBinaryPath}" "$@"\n`);
      await chmod(paths.convenienceShimPath, 0o755);
      return paths.convenienceShimPath;
    } catch {
      warn(`Could not create convenience shim at ${paths.convenienceShimPath}.`);
      return undefined;
    }
  }
}

async function setupUnixShellProfile(
  binDir: string,
  env: NodeJS.ProcessEnv,
  warn: (message: string) => void
): Promise<void> {
  if (!env.HOME) {
    warn(`HOME is not set. Add ${binDir} to PATH manually.`);
    return;
  }

  const shellName = basename(env.SHELL ?? 'sh');
  const profile =
    shellName === 'fish'
      ? join(env.HOME, '.config', 'fish', 'config.fish')
      : shellName === 'zsh'
        ? join(env.HOME, '.zshrc')
        : getBashProfile(env.HOME);
  const line = shellName === 'fish' ? `fish_add_path ${binDir}` : `export PATH="${binDir}:$PATH"`;

  try {
    await appendProfileEntry(profile, binDir, line);
  } catch {
    warn(`Could not update ${profile}. Add ${binDir} to PATH manually.`);
  }
}

function getBashProfile(home: string): string {
  const bashrc = join(home, '.bashrc');
  return existsSync(bashrc) ? bashrc : join(home, '.bash_profile');
}

async function appendProfileEntry(profile: string, binDir: string, line: string): Promise<void> {
  let content = '';
  try {
    content = await readFile(profile, 'utf-8');
  } catch {
    await mkdir(dirname(profile), { recursive: true });
  }

  if (content.includes(binDir)) {
    return;
  }

  await writeFile(
    profile,
    `${content}${content.endsWith('\n') || content === '' ? '' : '\n'}\n# Elements CLI\n${line}\n`
  );
}

function setupWindowsPath(binDir: string, env: NodeJS.ProcessEnv, warn: (message: string) => void): void {
  const escapedBinDir = powershellSingleQuote(binDir);
  const script = [
    `$entry = ${escapedBinDir}`,
    "$current = [Environment]::GetEnvironmentVariable('Path', 'User')",
    "$entries = @($current -split ';' | Where-Object { $_ })",
    "if (-not ($entries | Where-Object { $_.TrimEnd('\\') -ieq $entry.TrimEnd('\\') })) {",
    "  [Environment]::SetEnvironmentVariable('Path', (@($entry) + $entries) -join ';', 'User')",
    '}'
  ].join('; ');
  const result = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    encoding: 'utf-8'
  });

  if (result.status !== 0) {
    warn(`Could not update the user PATH. Add ${binDir} manually.`);
  }

  prependPathEntry(binDir, env, 'win32');
}

function powershellSingleQuote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function prependPathEntry(entry: string, env: NodeJS.ProcessEnv, platform: NodeJS.Platform): void {
  const pathValue = env.PATH ?? env.Path ?? '';
  if (hasPathEntry(pathValue, entry, platform)) {
    return;
  }

  const separator = platform === 'win32' ? ';' : ':';
  env.PATH = pathValue ? `${entry}${separator}${pathValue}` : entry;
  if (platform === 'win32') {
    env.Path = env.PATH;
  }
}

function hasPathEntry(pathValue: string, entry: string, platform: NodeJS.Platform): boolean {
  return pathValue
    .split(platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .some(pathEntry => normalizePathEntry(pathEntry, platform) === normalizePathEntry(entry, platform));
}

function normalizePathEntry(pathEntry: string, platform: NodeJS.Platform): string {
  const trimmed = pathEntry.replace(/[\\/]+$/, '');
  return platform === 'win32' ? trimmed.toLowerCase() : trimmed;
}

function verifyVersion(binaryPath: string, env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string {
  const result = spawnVersion(binaryPath, env, platform);
  if (result.error || result.status !== 0) {
    const message =
      result.error?.message ?? (result.stderr.trim() || result.stdout.trim() || `exit code ${result.status}`);
    throw new Error(`Direct canonical execution failed: ${binaryPath} --version\n${message}`);
  }

  return result.stdout.trim() || result.stderr.trim();
}

function spawnVersion(binaryPath: string, env: NodeJS.ProcessEnv, platform: NodeJS.Platform): SpawnSyncReturns<string> {
  return spawnSync(binaryPath, ['--version'], {
    encoding: 'utf-8',
    env,
    shell: platform === 'win32' && binaryPath.toLowerCase().endsWith('.cmd')
  });
}

function findExecutableOnPath(command: string, env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string | undefined {
  const pathValue = env.PATH ?? env.Path ?? '';
  const names = platform === 'win32' ? [`${command}.exe`, `${command}.cmd`, command] : [command];
  const separator = platform === 'win32' ? ';' : ':';
  const path = platform === 'win32' ? win32 : { join };

  for (const pathEntry of pathValue.split(separator).filter(Boolean)) {
    for (const name of names) {
      const candidate = path.join(pathEntry, name);
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {}
    }
  }

  return undefined;
}

function getManifestPlatform(platform: NodeJS.Platform): string {
  return platform === 'win32' ? 'Windows' : `${platform}/${process.arch}`;
}

async function installGlobalElementsSkill(context: InstallContext): Promise<void> {
  if (!(await shouldInstallGlobalElementsSkill(context))) {
    return;
  }

  const skillPath = getGlobalElementsSkillPath(context.env, context.platform);
  if (!skillPath) {
    context.warn('Could not install Elements agent skill. HOME is not set.');
    return;
  }

  try {
    await writeGlobalElementsSkill(skillPath);
    context.log(`Installed agent skill at ${skillPath}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    context.warn(`Could not install Elements agent skill at ${skillPath}. ${message}`);
  }
}

async function shouldInstallGlobalElementsSkill({ env, prompt }: InstallContext): Promise<boolean> {
  if (env.CI) {
    return false;
  }

  try {
    const answer = await prompt('Install Elements agent skill globally? (Y/n) ');
    if (answer === undefined) {
      return true;
    }

    return !['n', 'no'].includes(answer.trim().toLowerCase());
  } catch {
    return true;
  }
}

function getGlobalElementsSkillPath(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string | undefined {
  const home = platform === 'win32' ? env.USERPROFILE : env.HOME;
  if (!home) {
    return undefined;
  }

  const path = platform === 'win32' ? win32 : { join };
  return path.join(home, '.agents', 'skills', 'elements', 'SKILL.md');
}

async function writeGlobalElementsSkill(skillPath: string): Promise<void> {
  const skill = skills.find(s => s.name === 'elements');
  if (!skill) {
    throw new Error('Elements skill not found');
  }

  await mkdir(dirname(skillPath), { recursive: true });
  await writeFile(skillPath, formatSkillMarkdown(skill));
}

async function promptFromTerminal(question: string, platform: NodeJS.Platform): Promise<string | undefined> {
  if (process.env.CI) {
    return undefined;
  }

  if (process.stdin.isTTY && process.stdout.isTTY) {
    return readPrompt(question, process.stdin, process.stdout);
  }

  if (platform !== 'win32' && existsSync('/dev/tty')) {
    return readPromptFromUnixTty(question);
  }

  return undefined;
}

async function readPromptFromUnixTty(question: string): Promise<string | undefined> {
  const input = createReadStream('/dev/tty');
  const output = createWriteStream('/dev/tty');
  try {
    return await readPrompt(question, input, output);
  } catch {
    return undefined;
  } finally {
    input.destroy();
    output.end();
  }
}

async function readPrompt(question: string, input: Readable, output: Writable): Promise<string> {
  const readline = createInterface({ input, output });
  try {
    return await readline.question(question);
  } finally {
    readline.close();
  }
}

function printInstallSummary(
  context: InstallContext,
  pathExecutable: string,
  restrictedPathExecutionWorked: boolean
): void {
  if (context.env.NVE_INSTALL_DEBUG === '1') {
    printDiagnostics(context, pathExecutable, restrictedPathExecutionWorked);
    return;
  }
  context.log(`Installed CLI at ${context.paths.canonicalBinaryPath}`);
  console.log(`\n${colors.complete('Elements CLI installed successfully!')}`);
  console.log(`\n  Run ${colors.info('nve')} to get started.\n`);
}

function printDiagnostics(
  context: InstallContext,
  pathExecutable: string,
  restrictedPathExecutionWorked: boolean
): void {
  getDiagnostics(context, pathExecutable, restrictedPathExecutionWorked).forEach(line => context.log(line));
}

function getDiagnostics(
  { env, paths, platform }: InstallContext,
  pathExecutable: string,
  restrictedPathExecutionWorked: boolean
): string[] {
  return [
    '',
    'Diagnostics:',
    `  canonical path: ${paths.canonicalBinaryPath}`,
    '  direct canonical execution: ok',
    ...getPlatformDiagnostics(env, platform, restrictedPathExecutionWorked),
    `  PATH nve: ${pathExecutable || 'not found'}`,
    '  current PATH entries:',
    ...getPathEntries(env, platform).map(pathEntry => `    ${pathEntry}`),
    `  manifest path: ${paths.manifestPath}`,
    '  recommendation: For agents and CI, use the canonical path.',
    ...(platform === 'win32'
      ? ['  Windows note: restart open terminals before expecting PATH changes to appear there.']
      : [])
  ];
}

function getPlatformDiagnostics(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform,
  restrictedPathExecutionWorked: boolean
): string[] {
  if (platform === 'win32') {
    return [
      `  PATH Get-Command nve: ${getPowerShellCommandPath(env) || 'not found'}`,
      `  PATH where.exe nve: ${getWhereCommandPath(env) || 'not found'}`
    ];
  }

  return [
    `  restricted PATH direct execution: ${restrictedPathExecutionWorked ? 'ok' : 'failed'} (${UNIX_RESTRICTED_PATH})`,
    `  PATH command -v nve: ${getCommandPath(env) || 'not found'}`
  ];
}

function getPathEntries(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string[] {
  return (env.PATH ?? env.Path ?? '').split(platform === 'win32' ? ';' : ':').filter(Boolean);
}

function getCommandPath(env: NodeJS.ProcessEnv): string {
  const result = spawnSync('sh', ['-c', 'command -v nve'], { encoding: 'utf-8', env });
  return result.status === 0 ? result.stdout.trim() : '';
}

function getPowerShellCommandPath(env: NodeJS.ProcessEnv): string {
  const result = spawnSync(
    'powershell',
    ['-NoProfile', '-Command', '(Get-Command nve -ErrorAction SilentlyContinue).Source'],
    { encoding: 'utf-8', env }
  );
  return result.status === 0 ? result.stdout.trim() : '';
}

function getWhereCommandPath(env: NodeJS.ProcessEnv): string {
  const result = spawnSync('where.exe', ['nve'], { encoding: 'utf-8', env });
  return result.status === 0 ? result.stdout.trim().replaceAll(/\r?\n/g, ', ') : '';
}

export const installInternals = {
  createWindowsCommandShim,
  findExecutableOnPath,
  getCommandPath,
  getDiagnostics,
  getManifestPlatform,
  getPathEntries,
  getPowerShellCommandPath,
  getWhereCommandPath,
  hasPathEntry,
  normalizePathEntry,
  powershellSingleQuote,
  prependPathEntry,
  promptFromTerminal,
  readPrompt,
  spawnVersion,
  setupWindowsPath
};
