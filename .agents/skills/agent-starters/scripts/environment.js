// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_TIMEOUT_MS = 10 * 60_000;
const MAX_CAPTURED_OUTPUT_LENGTH = 64 * 1024;

const PASSTHROUGH_ENVIRONMENT_KEYS = [
  'COMSPEC',
  'LANG',
  'LANGUAGE',
  'LC_ALL',
  'LC_CTYPE',
  'NODE_EXTRA_CA_CERTS',
  'PATH',
  'PATHEXT',
  'SSL_CERT_DIR',
  'SSL_CERT_FILE',
  'SYSTEMROOT',
  'SystemRoot',
  'TZ',
  'WINDIR'
];
const CACHE_DIRECTORIES = {
  npm_config_cache: 'npm',
  npm_config_prefix: 'npm-prefix',
  npm_config_tmp: 'npm-tmp',
  pnpm_config_store_dir: 'pnpm-store',
  PNPM_HOME: 'pnpm-home',
  COREPACK_HOME: 'corepack',
  XDG_CACHE_HOME: 'xdg',
  GOCACHE: 'go-build',
  GOMODCACHE: 'go-mod',
  GOPATH: 'go-path',
  HUGO_CACHEDIR: 'hugo',
  NEXT_CACHE_DIR: 'next',
  NUXT_DATA_DIR: 'nuxt'
};

async function commandPath(command) {
  const result = await runCommand('which', [command], { timeoutMs: 10_000 });
  if (!result.ok) throw new Error(`Required command ${command} was not found.`);
  return result.stdout.trim();
}

function quoteCommand(command, args) {
  return [command, ...args]
    .map(value => (/^[A-Za-z0-9_./:=@-]+$/.test(value) ? value : JSON.stringify(value)))
    .join(' ');
}

function appendOutputTail(output, chunk) {
  const combined = output + chunk;
  return combined.length > MAX_CAPTURED_OUTPUT_LENGTH ? combined.slice(-MAX_CAPTURED_OUTPUT_LENGTH) : combined;
}

async function terminate(child) {
  if (!child || child.exitCode !== null) return;
  try {
    process.platform === 'win32' ? child.kill('SIGTERM') : process.kill(-child.pid, 'SIGTERM');
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 750));
  if (child.exitCode !== null) return;
  try {
    process.platform === 'win32' ? child.kill('SIGKILL') : process.kill(-child.pid, 'SIGKILL');
  } catch {}
}

export async function runCommand(command, args = [], options = {}) {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let stdout = '';
  let stderr = '';
  const logStream = options.logFile ? createWriteStream(options.logFile) : undefined;
  let logError;
  let logBackpressured = false;
  const logComplete = logStream
    ? new Promise(resolve => {
        logStream.on('error', error => {
          logError ??= error;
          void terminate(child);
          resolve();
        });
        logStream.once('close', resolve);
      })
    : undefined;
  function writeLog(chunk) {
    if (!logStream || logError) return;
    if (!logStream.write(chunk) && !logBackpressured) {
      logBackpressured = true;
      child.stdout.pause();
      child.stderr.pause();
      logStream.once('drain', () => {
        logBackpressured = false;
        if (logError) return;
        child.stdout.resume();
        child.stderr.resume();
      });
    }
  }
  child.stdout.on('data', chunk => {
    stdout = appendOutputTail(stdout, chunk);
    writeLog(chunk);
  });
  child.stderr.on('data', chunk => {
    stderr = appendOutputTail(stderr, chunk);
    writeLog(chunk);
  });
  let timedOut = false;
  const progressTimer = options.progress
    ? setInterval(
        () =>
          options.progress(
            `${options.progressLabel ?? quoteCommand(command, args)} still running (${Math.round((Date.now() - startedAt) / 1000)}s)`
          ),
        options.progressIntervalMs ?? 30_000
      )
    : undefined;
  progressTimer?.unref();
  const timer = setTimeout(async () => {
    timedOut = true;
    await terminate(child);
  }, timeoutMs);
  const { code, signal, spawnError } = await new Promise(resolve => {
    let spawnError;
    child.on('error', error => (spawnError = error));
    child.on('close', (code, signal) => resolve({ code, signal, spawnError }));
  });
  clearTimeout(timer);
  if (progressTimer) clearInterval(progressTimer);
  if (logStream && !logStream.destroyed) logStream.end();
  await logComplete;
  if (logError) {
    throw new Error(`Command log ${options.logFile} could not be written: ${logError.message}`, { cause: logError });
  }
  return {
    args,
    command,
    display: quoteCommand(command, args),
    durationMs: Date.now() - startedAt,
    exitCode: code,
    ok: !timedOut && !spawnError && code === 0,
    signal,
    stderr,
    stdout,
    timedOut
  };
}

export async function assertCacheDirectoriesEmpty(cacheDirectories) {
  const nonempty = [];
  for (const directory of cacheDirectories) {
    await mkdir(directory, { recursive: true });
    if ((await readdir(directory)).length) nonempty.push(directory);
  }
  if (nonempty.length) throw new Error(`Cache directories were not empty: ${nonempty.join(', ')}`);
}

export async function createIsolatedEnvironment(root, name, baseEnv = process.env) {
  const isolatedRoot = path.join(root, 'isolated', name);
  const cacheRoot = path.join(isolatedRoot, 'caches');
  const values = {
    HOME: path.join(isolatedRoot, 'home'),
    TMPDIR: path.join(isolatedRoot, 'tmp'),
    ...Object.fromEntries(
      Object.entries(CACHE_DIRECTORIES).map(([key, directory]) => [key, path.join(cacheRoot, directory)])
    )
  };
  const cacheDirectories = Object.keys(CACHE_DIRECTORIES).map(key => values[key]);
  await Promise.all([values.HOME, values.TMPDIR].map(directory => mkdir(directory, { recursive: true })));
  await assertCacheDirectoriesEmpty(cacheDirectories);
  const passthroughEnvironment = Object.fromEntries(
    PASSTHROUGH_ENVIRONMENT_KEYS.flatMap(key => (typeof baseEnv[key] === 'string' ? [[key, baseEnv[key]]] : []))
  );
  return {
    cacheDirectories,
    env: {
      ...passthroughEnvironment,
      ...values,
      TEMP: values.TMPDIR,
      TMP: values.TMPDIR,
      CI: '1',
      npm_config_audit: 'false',
      npm_config_fund: 'false',
      npm_config_offline: 'false',
      npm_config_prefer_offline: 'false',
      npm_config_update_notifier: 'false'
    },
    root: isolatedRoot
  };
}

export function applyReleaseAgeOverride(env) {
  return { ...env, pnpm_config_minimum_release_age: '0' };
}

export function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

async function wrapCommand(toolBin, name, target) {
  const destination = path.join(toolBin, name);
  await writeFile(destination, `#!/bin/sh\nexec ${shellQuote(target)} "$@"\n`, { mode: 0o755 });
}

export async function createToolBin(root) {
  const toolBin = path.join(root, 'tool-bin');
  await mkdir(toolBin, { recursive: true });
  for (const command of ['node', 'npm', 'npx', 'pnpm', 'git', 'go', 'hugo']) {
    try {
      const target = await commandPath(command);
      if (command === 'npm' || command === 'npx') await wrapCommand(toolBin, command, target);
      else await symlink(target, path.join(toolBin, command));
    } catch (error) {
      if (['go', 'hugo'].includes(command)) continue;
      throw error;
    }
  }
  return toolBin;
}
