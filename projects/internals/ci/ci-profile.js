/**
 * @license
 * Copyright 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus, freemem, platform, release, tmpdir, totalmem } from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const METRICS_DIR = path.join(ROOT_DIR, '.metrics');
const RUN_COUNT = 3;
const TOP_COUNT = 10;
const COMPOSITE_SCRIPTS = new Set(['.:ci']);
const ANSI_PATTERN = /\u001b\[[0-?]*[ -/]*[@-~]/g;
const RUNNING_PATTERN = /🏃 \[([^\]]+)\] Running command "(.*)"$/;
const SUCCESS_PATTERN = /✅ \[([^\]]+)\] Executed successfully$/;

function normalizeScriptId(label) {
  return label.includes(':') ? label : `.:${label}`;
}

export function createWireitLineParser({ now = () => performance.now() } = {}) {
  let pending = '';
  const starts = new Map();
  const scripts = [];

  function parseLine(rawLine) {
    const line = rawLine.replace(ANSI_PATTERN, '').trim();
    const running = line.match(RUNNING_PATTERN);
    if (running) {
      const id = normalizeScriptId(running[1]);
      starts.set(id, { command: running[2], startMs: now() });
      return;
    }

    const success = line.match(SUCCESS_PATTERN);
    if (!success) {
      return;
    }

    const id = normalizeScriptId(success[1]);
    const start = starts.get(id);
    if (!start) {
      return;
    }
    starts.delete(id);
    scripts.push({
      id,
      command: start.command,
      durationMs: now() - start.startMs,
      composite: COMPOSITE_SCRIPTS.has(id)
    });
  }

  return {
    write(chunk) {
      pending += chunk;
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? '';
      for (const line of lines) {
        parseLine(line);
      }
    },
    finish() {
      if (pending) {
        parseLine(pending);
        pending = '';
      }
      return {
        scripts,
        incomplete: [...starts.keys()].sort()
      };
    }
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function aggregateRuns(runs, expectedRuns = runs.length) {
  const samples = new Map();
  for (const run of runs) {
    for (const script of run.scripts) {
      const current = samples.get(script.id) ?? {
        id: script.id,
        command: script.command,
        composite: script.composite,
        durationsMs: []
      };
      current.durationsMs.push(script.durationMs);
      samples.set(script.id, current);
    }
  }

  return [...samples.values()]
    .map(script => ({
      ...script,
      sampleCount: script.durationsMs.length,
      complete: script.durationsMs.length === expectedRuns,
      minMs: Math.min(...script.durationsMs),
      medianMs: median(script.durationsMs),
      maxMs: Math.max(...script.durationsMs)
    }))
    .sort((left, right) => right.medianMs - left.medianMs || left.id.localeCompare(right.id));
}

function seconds(milliseconds) {
  return (milliseconds / 1000).toFixed(2);
}

function percent(part, whole) {
  return whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : '—';
}

function escapeTable(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function renderReport({ metadata, runs, scripts }) {
  const completeLeafScripts = scripts.filter(script => script.complete && !script.composite);
  const topScripts = completeLeafScripts.slice(0, TOP_COUNT);
  const composites = scripts.filter(script => script.complete && script.composite);
  const medianCiMs = median(runs.map(run => run.durationMs));
  const generatedAt = new Date(metadata.generatedAt).toISOString();
  const rows = topScripts.map(
    (script, index) =>
      `| ${index + 1} | \`${script.id}\` | ${seconds(script.medianMs)} s | ${seconds(script.minMs)} s | ${seconds(script.maxMs)} s | ${percent(script.medianMs, medianCiMs)} | \`${escapeTable(script.command)}\` |`
  );

  const output = [
    '---',
    "title: 'CI performance profile'",
    "description: 'Cold local Wireit timing results for the Elements continuous integration pipeline.'",
    '---',
    '',
    '# CI performance profile',
    '',
    `Generated ${generatedAt} from commit \`${metadata.commit}\`${metadata.dirty ? ' with local profiling changes' : ''}.`,
    '',
    '## Methodology',
    '',
    `The profiler ran \`pnpm run ci:reset\` before each of ${runs.length} samples, then timed \`pnpm run ci\` with \`CI=true\`, \`WIREIT_CACHE=none\`, \`PAGES_BASE_URL=/elements/\`, and Wireit's default concurrency. Reset and dependency installation time is not part of the CI duration. Rankings use median command execution time and exclude dependency wait time, cache hits, commandless orchestration targets, and composite commands that invoke other Wireit scripts.`,
    '',
    `Environment: ${metadata.platform} ${metadata.release}, ${metadata.cpuModel}, ${metadata.cpuCount} logical CPUs, ${metadata.memoryGiB} GiB memory, Node ${metadata.node}, pnpm ${metadata.pnpm}, Wireit ${metadata.wireit}.`,
    '',
    '| Run | CI duration | Executed scripts | Incomplete scripts |',
    '| ---: | ---: | ---: | ---: |',
    ...runs.map(
      (run, index) =>
        `| ${index + 1} | ${seconds(run.durationMs)} s | ${run.scripts.length} | ${run.incomplete.length} |`
    ),
    `| **Median** | **${seconds(medianCiMs)} s** |  |  |`,
    '',
    '## Ten slowest scripts',
    '',
    '| Rank | Script | Median | Minimum | Maximum | Median CI share | Command |',
    '| ---: | --- | ---: | ---: | ---: | ---: | --- |',
    ...rows,
    '',
    'The CI-share column compares a script duration with total CI wall time. Scripts run concurrently, so these percentages are not additive and do not represent isolated CPU usage.',
    '',
    '## Composite commands',
    '',
    ...(composites.length
      ? composites.map(
          script =>
            `- \`${script.id}\`: ${seconds(script.medianMs)} s median (${seconds(script.minMs)}–${seconds(script.maxMs)} s). Command: \`${script.command}\`.`
        )
      : ['No composite command completed in every sample.']),
    '',
    '## Optimization feedback',
    '',
    'Review the top-ten scripts against their Wireit configuration and underlying tool configuration before proposing changes. Record evidence, expected effect, a follow-up measurement, and confidence for each recommendation.',
    ''
  ];

  return output.join('\n');
}

function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env: process.env,
    ...options
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `:\n${detail}` : ''}`);
  }
  return result.stdout.trim();
}

function getMetadata() {
  const cpuList = cpus();
  const wireitPackage = JSON.parse(readFileSync(path.join(ROOT_DIR, 'node_modules/wireit/package.json'), 'utf8'));
  const status = runSync('git', ['status', '--porcelain']);
  return {
    generatedAt: new Date().toISOString(),
    commit: runSync('git', ['rev-parse', 'HEAD']),
    dirty: status.length > 0,
    dirtyFiles: status ? status.split('\n') : [],
    platform: platform(),
    release: release(),
    cpuModel: cpuList[0]?.model ?? 'unknown CPU',
    cpuCount: cpuList.length,
    memoryGiB: (totalmem() / 1024 ** 3).toFixed(1),
    freeMemoryGiB: (freemem() / 1024 ** 3).toFixed(1),
    node: process.version,
    pnpm: runSync('pnpm', ['--version']),
    wireit: wireitPackage.version
  };
}

function runChild(command, args, { env = process.env, parser, logPath }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT_DIR,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
      parser?.write(chunk);
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      writeFileSync(logPath, `${stdout}${stderr ? `\n--- stderr ---\n${stderr}` : ''}`);
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} failed with ${signal ?? `exit code ${code}`}`));
        return;
      }
      resolve();
    });
  });
}

async function benchmarkRun(index, temporaryDirectory) {
  const resetLog = path.join(temporaryDirectory, `run-${index}-reset.log`);
  const ciLog = path.join(temporaryDirectory, `run-${index}-ci.log`);
  console.log(`Run ${index}/${RUN_COUNT}: resetting ignored outputs and dependencies...`);
  await runChild('mise', ['exec', '--', 'pnpm', 'run', 'ci:reset'], {
    env: { ...process.env, CI: 'true' },
    logPath: resetLog
  });

  console.log(`Run ${index}/${RUN_COUNT}: running cold CI...`);
  const parser = createWireitLineParser();
  const start = performance.now();
  await runChild('mise', ['exec', '--', 'pnpm', 'run', 'ci'], {
    env: {
      ...process.env,
      CI: 'true',
      PAGES_BASE_URL: '/elements/',
      WIREIT_CACHE: 'none',
      WIREIT_LOGGER: 'simple'
    },
    parser,
    logPath: ciLog
  });
  const durationMs = performance.now() - start;
  const parsed = parser.finish();
  console.log(`Run ${index}/${RUN_COUNT}: completed in ${seconds(durationMs)} seconds.`);
  return {
    durationMs,
    ...parsed,
    resetLog,
    ciLog
  };
}

function copyLogs(runs) {
  mkdirSync(METRICS_DIR, { recursive: true });
  for (const [index, run] of runs.entries()) {
    writeFileSync(path.join(METRICS_DIR, `ci-profile-run-${index + 1}.log`), readFileSync(run.ciLog));
    writeFileSync(path.join(METRICS_DIR, `ci-profile-reset-${index + 1}.log`), readFileSync(run.resetLog));
  }
}

function copyTemporaryLogs(temporaryDirectory) {
  mkdirSync(METRICS_DIR, { recursive: true });
  for (const fileName of readdirSync(temporaryDirectory)) {
    writeFileSync(
      path.join(METRICS_DIR, `ci-profile-${fileName}`),
      readFileSync(path.join(temporaryDirectory, fileName))
    );
  }
}

export async function main() {
  const metadata = getMetadata();
  if (metadata.dirty && process.env.CI_PROFILE_ALLOW_DIRTY !== '1') {
    throw new Error(
      `CI profiling requires a clean worktree. Commit or stash these changes first:\n${metadata.dirtyFiles.join('\n')}`
    );
  }

  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'elements-ci-profile-'));
  const runs = [];
  try {
    for (let index = 1; index <= RUN_COUNT; index++) {
      runs.push(await benchmarkRun(index, temporaryDirectory));
    }
    const scripts = aggregateRuns(runs, RUN_COUNT);
    const incomplete = scripts.filter(script => !script.complete);
    if (incomplete.length) {
      throw new Error(
        `The following scripts did not produce ${RUN_COUNT} samples:\n${incomplete.map(script => script.id).join('\n')}`
      );
    }

    mkdirSync(METRICS_DIR, { recursive: true });
    copyLogs(runs);
    const serializableRuns = runs.map(({ resetLog: _resetLog, ciLog: _ciLog, ...run }) => run);
    writeFileSync(
      path.join(METRICS_DIR, 'ci-profile.json'),
      `${JSON.stringify({ metadata, runs: serializableRuns, scripts }, null, 2)}\n`
    );
    writeFileSync(path.join(METRICS_DIR, 'ci-profile.md'), `${renderReport({ metadata, runs, scripts })}\n`);
    console.log(`Profile written to ${path.relative(ROOT_DIR, METRICS_DIR)}/ci-profile.{json,md}.`);
  } catch (error) {
    copyTemporaryLogs(temporaryDirectory);
    throw error;
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
