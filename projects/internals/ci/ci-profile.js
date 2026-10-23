/**
 * @license
 * Copyright 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
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

export function profileOptions(args = process.argv.slice(2)) {
  const options = { target: 'ci', samples: RUN_COUNT, reset: 'cold' };
  const optionalKeys = { '--compare-ref': 'compareRef', '--order': 'order' };
  for (let index = 0; index < args.length; index += 2) {
    const key = optionalKeys[args[index]] ?? args[index].replace(/^--/, '');
    if ((!Object.hasOwn(options, key) && !Object.values(optionalKeys).includes(key)) || args[index + 1] === undefined) {
      throw new Error('Usage: ci:profile [--target ci|lighthouse] [--samples N] [--reset cold|none]');
    }
    options[key] = key === 'samples' ? Number(args[index + 1]) : args[index + 1];
  }
  if (
    !['ci', 'lighthouse'].includes(options.target) ||
    !['cold', 'none'].includes(options.reset) ||
    !Number.isInteger(options.samples) ||
    options.samples < 1
  ) {
    throw new Error('Invalid profile options');
  }
  if (
    (options.order && !['baseline-first', 'candidate-first'].includes(options.order)) ||
    (options.compareRef && options.reset !== 'cold')
  ) {
    throw new Error('Paired comparisons require cold resets and a valid execution order');
  }
  return options;
}

/** Resolves the actual Wireit graph, including commandless prerequisite tasks. */
export function wireitGraph(target, root = ROOT_DIR) {
  const graph = new Map();
  function visit(directory, task) {
    const id = `${path.relative(root, directory) || '.'}:${task}`;
    if (graph.has(id)) return;
    const config = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8')).wireit?.[task];
    if (!config) throw new Error(`Missing Wireit configuration: ${id}`);
    graph.set(id, { id, command: config.command });
    for (const dependency of config.dependencies ?? []) {
      const script = typeof dependency === 'string' ? dependency : dependency.script;
      const separator = script.indexOf(':');
      if (script.startsWith('.')) {
        visit(path.resolve(directory, script.slice(0, separator)), script.slice(separator + 1));
      } else {
        visit(directory, script);
      }
    }
  }
  visit(root, target);
  return [...graph.values()];
}

export function verifyLighthouseExecution(scripts, graph) {
  const executed = new Set(scripts.map(script => script.id));
  const expected = graph.filter(task => task.id.endsWith(':test:lighthouse'));
  const missing = expected.filter(task => !executed.has(task.id));
  if (!expected.length || missing.length) {
    throw new Error(`Lighthouse sample skipped expected test commands: ${missing.map(task => task.id).join(', ')}`);
  }
}

export function verifyLighthouseSummary(summary, id) {
  const assertions = summary.testResults?.flatMap(result => result.assertionResults) ?? [];
  if (
    !summary.success ||
    summary.numFailedTests ||
    !summary.numTotalTests ||
    summary.numPassedTests !== summary.numTotalTests ||
    assertions.length !== summary.numTotalTests ||
    assertions.some(assertion => assertion.status !== 'passed')
  ) {
    throw new Error(`Invalid or skipped Lighthouse tests for ${id}`);
  }
}

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
  const target = metadata.target ?? 'ci';
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
    `The profiler used reset mode \`${metadata.reset ?? 'cold'}\` for ${runs.length} samples, then timed \`pnpm run ${target}\` with \`CI=true\`, \`WIREIT_CACHE=none\`, \`PAGES_BASE_URL=/elements/\`, and Wireit's default concurrency. Cold mode runs \`pnpm run ci:reset\`; none mode preserves existing outputs and incremental freshness. Reset and dependency installation time is separate from execution time. Lighthouse samples must execute every test command in the current Wireit graph. Rankings exclude dependency wait time, cache hits, commandless targets, and composite commands.`,
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

export function processTreeRss(rows, rootPid) {
  const descendants = new Set([rootPid]);
  let previousSize;
  do {
    previousSize = descendants.size;
    for (const row of rows) if (descendants.has(row.ppid)) descendants.add(row.pid);
  } while (descendants.size !== previousSize);
  return rows.filter(row => descendants.has(row.pid)).reduce((sum, row) => sum + row.rssKiB, 0);
}

export function runChild(
  command,
  args,
  { env = process.env, parser, logPath, resources = false, stream = false, cwd = ROOT_DIR }
) {
  return new Promise((resolve, reject) => {
    const child = spawn(resources ? '/usr/bin/time' : command, resources ? ['-p', command, ...args] : args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    const usage = { peakTreeRssMiB: 0, minimumFreeMemoryGiB: freemem() / 1024 ** 3, samples: 0 };
    const interval = resources
      ? setInterval(() => {
          const result = spawnSync('ps', ['-A', '-o', 'pid=,ppid=,rss='], { encoding: 'utf8' });
          if (result.status !== 0) return;
          const rows = result.stdout
            .trim()
            .split('\n')
            .map(line => {
              const [pid, ppid, rssKiB] = line.trim().split(/\s+/).map(Number);
              return { pid, ppid, rssKiB };
            });
          usage.peakTreeRssMiB = Math.max(usage.peakTreeRssMiB, processTreeRss(rows, child.pid) / 1024);
          usage.minimumFreeMemoryGiB = Math.min(usage.minimumFreeMemoryGiB, freemem() / 1024 ** 3);
          usage.samples++;
        }, 1000)
      : undefined;

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
      parser?.write(chunk);
      if (stream) process.stdout.write(chunk);
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
      if (stream) process.stderr.write(chunk);
    });
    child.on('error', error => {
      clearInterval(interval);
      reject(error);
    });
    child.on('close', (code, signal) => {
      clearInterval(interval);
      writeFileSync(logPath, `${stdout}${stderr ? `\n--- stderr ---\n${stderr}` : ''}`);
      usage.userCpuSeconds = Number(stderr.match(/^user\s+([\d.]+)$/m)?.[1]);
      usage.systemCpuSeconds = Number(stderr.match(/^sys\s+([\d.]+)$/m)?.[1]);
      if (resources) writeFileSync(`${logPath}.resources.json`, JSON.stringify(usage, null, 2));
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} failed with ${signal ?? `exit code ${code}`}`));
        return;
      }
      resolve(usage);
    });
  });
}

async function benchmarkRun(index, temporaryDirectory, options, graph) {
  const resetLog = path.join(temporaryDirectory, `run-${index}-reset.log`);
  const ciLog = path.join(temporaryDirectory, `run-${index}-ci.log`);
  const phaseDirectory = path.join(temporaryDirectory, `phases-${index}`);
  mkdirSync(phaseDirectory);
  const resetStart = performance.now();
  if (options.reset === 'cold') {
    console.log(`Run ${index}/${options.samples}: resetting ignored outputs and dependencies...`);
    await runChild('mise', ['exec', '--', 'pnpm', 'run', 'ci:reset'], {
      env: { ...process.env, CI: 'true' },
      logPath: resetLog
    });
  } else {
    writeFileSync(resetLog, 'No reset. Existing outputs and incremental state preserved.\n');
  }
  const resetMs = performance.now() - resetStart;

  console.log(`Run ${index}/${options.samples}: running ${options.target} (reset: ${options.reset})...`);
  const parser = createWireitLineParser();
  const start = performance.now();
  const resources = await runChild('mise', ['exec', '--', 'pnpm', 'run', options.target], {
    env: {
      ...process.env,
      CI: 'true',
      PAGES_BASE_URL: '/elements/',
      WIREIT_CACHE: 'none',
      WIREIT_LOGGER: 'simple',
      LIGHTHOUSE_PROFILE_DIR: phaseDirectory
    },
    parser,
    logPath: ciLog,
    resources: true,
    stream: options.target === 'lighthouse'
  });
  const durationMs = performance.now() - start;
  const parsed = parser.finish();
  if (parsed.incomplete.length) throw new Error(`Incomplete scripts: ${parsed.incomplete.join(', ')}`);
  if (options.target === 'lighthouse') verifyLighthouseExecution(parsed.scripts, graph);
  const phases = readdirSync(phaseDirectory)
    .flatMap(file =>
      readFileSync(path.join(phaseDirectory, file), 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line))
    )
    .sort((a, b) => a.startTime - b.startTime);
  writeFileSync(path.join(temporaryDirectory, `run-${index}-phases.json`), JSON.stringify(phases, null, 2));
  const tests =
    options.target === 'lighthouse'
      ? graph
          .filter(task => task.id.endsWith(':test:lighthouse'))
          .map(task => {
            const directory = task.id.slice(0, -':test:lighthouse'.length);
            // The site inherits its JSON reporter path from the Node test configuration.
            const summaryPaths = ['coverage/lighthouse/summary.json', 'coverage/unit/summary.json'];
            const summaryPath = summaryPaths
              .map(file => path.join(ROOT_DIR, directory, file))
              .find(file => {
                try {
                  return JSON.parse(readFileSync(file, 'utf8')).startTime >= Date.now() - durationMs - 1000;
                } catch {
                  return false;
                }
              });
            if (!summaryPath) throw new Error(`No fresh test summary for ${task.id}`);
            const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
            verifyLighthouseSummary(summary, task.id);
            const reportDirectory = path.join(ROOT_DIR, directory, '.lighthouse/dist');
            let reports;
            if (directory !== 'projects/site') {
              reports = JSON.parse(readFileSync(path.join(reportDirectory, 'report.json'), 'utf8'));
              const fixtureNames = readdirSync(reportDirectory, { withFileTypes: true })
                .filter(entry => entry.isDirectory())
                .filter(entry => {
                  try {
                    readFileSync(path.join(reportDirectory, entry.name, 'report.json'));
                    return true;
                  } catch {
                    return false;
                  }
                })
                .map(entry => entry.name)
                .sort();
              if (JSON.stringify(Object.keys(reports).sort()) !== JSON.stringify(fixtureNames)) {
                throw new Error(`Aggregate report differs from individual reports for ${task.id}`);
              }
            }
            return {
              id: task.id,
              total: summary.numTotalTests,
              passed: summary.numPassedTests,
              failed: summary.numFailedTests,
              reports,
              assertions: summary.testResults.flatMap(result =>
                result.assertionResults.map(assertion => ({
                  name: assertion.fullName,
                  status: assertion.status,
                  durationMs: assertion.duration,
                  failureMessages: assertion.failureMessages
                }))
              )
            };
          })
      : [];
  console.log(`Run ${index}/${options.samples}: completed in ${seconds(durationMs)} seconds.`);
  return {
    durationMs,
    resetMs,
    resources,
    phases,
    tests,
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
    if (fileName.startsWith('phases-')) {
      for (const phaseFile of readdirSync(path.join(temporaryDirectory, fileName))) {
        writeFileSync(
          path.join(METRICS_DIR, `ci-profile-${fileName}-${phaseFile}`),
          readFileSync(path.join(temporaryDirectory, fileName, phaseFile))
        );
      }
      continue;
    }
    writeFileSync(
      path.join(METRICS_DIR, `ci-profile-${fileName}`),
      readFileSync(path.join(temporaryDirectory, fileName))
    );
  }
}

async function compareRevisions(options, metadata) {
  const baseline = runSync('git', ['rev-parse', '--verify', '--end-of-options', `${options.compareRef}^{commit}`]);
  const revisions = { baseline, candidate: metadata.commit };
  const directory = mkdtempSync(path.join(tmpdir(), 'elements-ci-comparison-'));
  const destination = path.join(METRICS_DIR, 'ci-profile-comparison');
  const pairs = [];
  mkdirSync(destination, { recursive: true });
  try {
    for (let sample = 1; sample <= options.samples; sample++) {
      const candidateFirst = options.order === 'candidate-first' || (!options.order && sample % 2 === 0);
      const order = candidateFirst ? ['candidate', 'baseline'] : ['baseline', 'candidate'];
      const pair = { sample, order, results: {} };
      for (const role of order) {
        const worktree = path.join(directory, `${sample}-${role}`);
        const artifacts = path.join(destination, `${sample}-${role}`);
        let registered = false;
        try {
          runSync('git', ['worktree', 'add', '--detach', worktree, revisions[role]]);
          registered = true;
          // Metadata needs Wireit before reset. ci:reset removes this symlink and
          // installs the revision's own dependencies before the timed command.
          symlinkSync(path.join(ROOT_DIR, 'node_modules'), path.join(worktree, 'node_modules'), 'dir');
          console.log(`Pair ${sample}/${options.samples}: ${role} ${revisions[role]}...`);
          await runChild(
            'mise',
            [
              'exec',
              '--',
              'pnpm',
              'run',
              'ci:profile',
              '--target',
              options.target,
              '--samples',
              '1',
              '--reset',
              'cold'
            ],
            {
              cwd: worktree,
              env: { ...process.env, CI: 'true', CI_PROFILE_ALLOW_DIRTY: '0', MISE_TRUSTED_CONFIG_PATHS: directory },
              stream: true,
              logPath: path.join(destination, `${sample}-${role}.log`)
            }
          );
          pair.results[role] = JSON.parse(readFileSync(path.join(worktree, '.metrics/ci-profile.json'), 'utf8'));
        } finally {
          if (existsSync(path.join(worktree, '.metrics')))
            cpSync(path.join(worktree, '.metrics'), artifacts, { recursive: true });
          if (registered) runSync('git', ['worktree', 'remove', '--force', worktree]);
        }
      }
      pairs.push(pair);
      writeFileSync(path.join(destination, 'comparison.json'), JSON.stringify({ metadata, revisions, pairs }, null, 2));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export async function main() {
  const options = profileOptions();
  const metadata = getMetadata();
  Object.assign(metadata, options, {
    graph: wireitGraph(options.target),
    runner: {
      os: process.env.RUNNER_OS,
      arch: process.env.RUNNER_ARCH,
      image: process.env.ImageOS,
      imageVersion: process.env.ImageVersion,
      runId: process.env.GITHUB_RUN_ID
    }
  });
  if (metadata.dirty && process.env.CI_PROFILE_ALLOW_DIRTY !== '1') {
    throw new Error(
      `Profiling requires a clean worktree or CI_PROFILE_ALLOW_DIRTY=1 for intentional profiling changes:\n${metadata.dirtyFiles.join('\n')}`
    );
  }
  if (options.compareRef) {
    await compareRevisions(options, metadata);
    return;
  }

  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'elements-ci-profile-'));
  const runs = [];
  try {
    for (let index = 1; index <= options.samples; index++) {
      runs.push(await benchmarkRun(index, temporaryDirectory, options, metadata.graph));
    }
    const scripts = aggregateRuns(runs, options.samples);
    const incomplete = scripts.filter(script => !script.complete);
    if (incomplete.length) {
      throw new Error(
        `The following scripts did not produce ${options.samples} samples:\n${incomplete.map(script => script.id).join('\n')}`
      );
    }

    mkdirSync(METRICS_DIR, { recursive: true });
    copyLogs(runs);
    copyTemporaryLogs(temporaryDirectory);
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
