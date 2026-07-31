#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

/**
 * Deterministic task selection for the agent-upkeep skill.
 *
 * Every task in the rotation must be able to answer "do I have work?" here, not
 * in the agent's head. Otherwise a task cannot fall through to the next one when
 * it has nothing to do, and the run is wasted. So candidate discovery lives in
 * this script even where the search itself is a one-liner, and every emitted
 * selection carries a concrete target.
 */

const GUARDRAILS = {
  maxChangedLines: 150,
  maxChangedFiles: 4,
  coverageThreshold: 90,
  maxUncoveredLines: 40
};

const TASK_ROTATION = ['coverage', 'lint', 'bug'];

const RULE_DIFFICULTY = [
  '@typescript-eslint/no-unnecessary-type-conversion',
  '@typescript-eslint/no-unnecessary-template-expression',
  '@typescript-eslint/no-useless-default-assignment',
  '@typescript-eslint/no-unnecessary-type-assertion',
  '@typescript-eslint/prefer-readonly',
  '@typescript-eslint/no-redundant-type-constituents',
  '@typescript-eslint/prefer-reduce-type-parameter',
  '@typescript-eslint/await-thenable',
  '@typescript-eslint/require-await',
  '@typescript-eslint/use-unknown-in-catch-callback-variable',
  '@typescript-eslint/prefer-promise-reject-errors',
  '@typescript-eslint/no-unnecessary-type-parameters',
  '@typescript-eslint/no-extraneous-class',
  '@typescript-eslint/unbound-method',
  '@typescript-eslint/no-unnecessary-condition',
  '@typescript-eslint/no-misused-promises',
  '@typescript-eslint/no-deprecated',
  '@typescript-eslint/restrict-template-expressions',
  '@typescript-eslint/no-unsafe-enum-comparison',
  '@typescript-eslint/no-non-null-assertion',
  '@typescript-eslint/no-unsafe-argument',
  '@typescript-eslint/no-unsafe-call',
  '@typescript-eslint/no-unsafe-return',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unsafe-assignment'
];

const ESLINT_CONFIG = 'projects/internals/eslint/src/configs/typescript.js';
const DISABLED_MARKER = 'todo: enable these rules incrementally';
const SUPPRESSIONS_FILE = 'eslint-suppressions.json';
const COVERAGE_INPUT_FILE = /\.(?:[cm]?[jt]s|json|css|html|ya?ml)$/;

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.wireit',
  '.visual',
  '.lighthouse',
  '.11ty-vite',
  '.git'
]);

const forcedTask = process.argv
  .slice(2)
  .find(a => a.startsWith('--task='))
  ?.split('=')[1];

function fail(reason, extra = {}) {
  console.log(JSON.stringify({ selected: false, reason, ...extra }, null, 2));
  process.exit(1);
}

function emit(selection) {
  console.log(JSON.stringify({ selected: true, guardrails: GUARDRAILS, ...selection }, null, 2));
}

async function git(argv) {
  const { stdout } = await run('git', argv, { maxBuffer: 20 * 1024 * 1024 });
  return stdout.trim();
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

function isRootContained(root, file) {
  const relative = path.relative(root, file);
  return !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`);
}

async function inFlightBranches() {
  await git(['fetch', '--prune', '--quiet', 'origin']);

  let head = 'origin/main';
  try {
    head = (await git(['symbolic-ref', 'refs/remotes/origin/HEAD'])).replace('refs/remotes/', '');
  } catch {
    // Fall back to origin/main.
  }

  const refs = await git(['for-each-ref', '--format=%(refname:short) %(objectname)', 'refs/remotes/origin/upkeep/']);

  const inFlight = [];
  for (const line of refs.split('\n').filter(Boolean)) {
    const [name, sha] = line.split(' ');
    try {
      await git(['merge-base', '--is-ancestor', sha, head]);
    } catch {
      inFlight.push(name.replace(/^origin\//, ''));
    }
  }
  return inFlight;
}

async function disabledRules(root) {
  let source;
  try {
    source = await readFile(path.join(root, ESLINT_CONFIG), 'utf8');
  } catch {
    fail(`could not read ${ESLINT_CONFIG}`);
  }
  const start = source.indexOf(DISABLED_MARKER);
  if (start === -1) fail(`marker comment "${DISABLED_MARKER}" not found in ${ESLINT_CONFIG}`);
  const block = source.slice(start, source.indexOf('\n  },', start));
  const found = [...block.matchAll(/'([^']+)':\s*'off'/g)].map(m => m[1]);
  return [
    ...RULE_DIFFICULTY.filter(rule => found.includes(rule)),
    ...found.filter(rule => !RULE_DIFFICULTY.includes(rule))
  ];
}

async function projectDirs(root) {
  const base = path.join(root, 'projects');
  const dirs = [];
  for (const entry of (await readdir(base, { withFileTypes: true })).filter(e => e.isDirectory())) {
    if (entry.name !== 'internals') {
      dirs.push(path.join(base, entry.name));
      continue;
    }
    const nested = await readdir(path.join(base, 'internals'), { withFileTypes: true });
    dirs.push(...nested.filter(e => e.isDirectory()).map(e => path.join(base, 'internals', e.name)));
  }
  return dirs;
}

/** Package-specific invocation context for ESLint suppressions. */
async function lintPackageContexts(root) {
  const packageFiles = await walk(path.join(root, 'projects'), name => name === 'package.json');
  const packages = [];

  for (const packageFile of packageFiles) {
    const data = await readJson(packageFile);
    const command = Object.entries(data?.wireit ?? {})
      .filter(([script]) => script === 'lint' || script.startsWith('lint:'))
      .map(([, config]) => config?.command)
      .find(value => typeof value === 'string' && /(?:^|\s)eslint(?:\s|$)/.test(value));
    if (!command) continue;

    const location = /(?:^|\s)--suppressions-location(?:=|\s+)(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(command);
    const workingDirectory = path.dirname(packageFile);
    packages.push({
      target: path.relative(root, workingDirectory),
      workingDirectory: path.relative(root, workingDirectory),
      suppressionsFile: location?.[1] ?? location?.[2] ?? location?.[3] ?? SUPPRESSIONS_FILE
    });
  }

  return packages.sort((a, b) => a.workingDirectory.localeCompare(b.workingDirectory));
}

async function coverageIsFresh(project, summaryFile) {
  try {
    const { mtimeMs: summaryMtime } = await stat(summaryFile);
    const inputs = await walk(project, name => COVERAGE_INPUT_FILE.test(name));
    if (inputs.length === 0) return false;

    for (const input of inputs) {
      if ((await stat(input)).mtimeMs > summaryMtime) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Fresh files below the coverage threshold, smallest remaining gap first. */
async function coverageCandidates(root) {
  const candidates = [];
  for (const project of await projectDirs(root)) {
    const summaryFile = path.join(project, 'coverage', 'unit', 'coverage-summary.json');
    if (!(await coverageIsFresh(project, summaryFile))) continue;
    const summary = await readJson(summaryFile);
    if (!summary) continue;
    for (const [file, m] of Object.entries(summary)) {
      if (file === 'total' || !m.lines) continue;
      const uncovered = m.lines.total - m.lines.covered;
      const below = m.lines.pct < GUARDRAILS.coverageThreshold || m.branches.pct < GUARDRAILS.coverageThreshold;
      if (!below || uncovered < 1 || uncovered > GUARDRAILS.maxUncoveredLines) continue;
      candidates.push({ project, file, uncovered, lines: m.lines.pct, branches: m.branches.pct });
    }
  }
  return candidates.sort((a, b) => a.uncovered - b.uncovered || a.lines - b.lines);
}

/**
 * Every `eslint-suppressions.json` in the repository, wherever it lives.
 *
 * ESLint writes the file to the directory it was invoked from and keys entries
 * by POSIX path relative to that same directory, so a file's own directory is
 * the working directory for any command that touches it. Shape is
 * Record<file, Record<ruleId, { count: number }>>.
 *
 * Returns the flattened entries smallest-group-first, plus the repo-wide total
 * so the pull request can report progress.
 */
async function suppressionCandidates(root) {
  const files = await walk(root, name => name === SUPPRESSIONS_FILE);
  const candidates = [];
  let total = 0;

  for (const suppressionsFile of files) {
    const data = await readJson(suppressionsFile);
    if (!data || typeof data !== 'object') continue;
    const dir = path.dirname(suppressionsFile);
    for (const [file, rules] of Object.entries(data)) {
      if (!rules || typeof rules !== 'object') continue;
      const resolvedFile = path.resolve(dir, file);
      if (!isRootContained(root, resolvedFile)) continue;
      for (const [rule, entry] of Object.entries(rules)) {
        const count = entry?.count ?? 0;
        if (count < 1) continue;
        total += count;
        candidates.push({ suppressionsFile, dir, file: resolvedFile, rule, count });
      }
    }
  }

  candidates.sort((a, b) => a.count - b.count || a.rule.localeCompare(b.rule) || a.file.localeCompare(b.file));
  return { candidates, total };
}

async function walk(dir, predicate, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(full, predicate, found);
    } else if (predicate(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Quarantined tests. An unconditional .skip is a written description of
 * behavior that should work and does not, so the acceptance criterion already
 * exists. Conditional guards such as .skipIf are capability checks, not bugs,
 * and do not match because `skipIf` is not followed by `(`.
 */
async function bugCandidates(root) {
  const candidates = [];
  const testFiles = await walk(path.join(root, 'projects'), name => /\.test(\.[a-z]+)?\.ts$/.test(name));

  for (const file of testFiles) {
    let source;
    try {
      source = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    source.split('\n').forEach((line, index) => {
      const match = /\b(?:it|test)\.(skip)\s*\(\s*(['"`])(.+?)\2/.exec(line);
      if (!match) return;
      candidates.push({
        file,
        line: index + 1,
        kind: match[1],
        title: match[3],
        // Visual baselines are off limits for this agent, so rank those last.
        weight: file.includes('.test.visual.') ? 1 : 0
      });
    });
  }

  return candidates.sort((a, b) => a.weight - b.weight || a.file.localeCompare(b.file));
}

async function main() {
  const root = await git(['rev-parse', '--show-toplevel']);
  const inFlight = await inFlightBranches();

  if (inFlight.length > 0) {
    fail('an unmerged upkeep branch already exists on the remote, so this run must not open another', {
      inFlightBranches: inFlight
    });
  }

  const day = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  const offset = day % TASK_ROTATION.length;
  const rotated = forcedTask ? [forcedTask] : [...TASK_ROTATION.slice(offset), ...TASK_ROTATION.slice(0, offset)];

  for (const task of rotated) {
    if (task === 'coverage') {
      const [best] = await coverageCandidates(root);
      if (!best) continue;
      return emit({
        task,
        target: path.relative(root, best.file),
        project: path.relative(root, best.project),
        rationale: `${best.uncovered} uncovered lines, ${best.lines}% lines and ${best.branches}% branches, the smallest gap below the ${GUARDRAILS.coverageThreshold}% threshold`
      });
    }

    if (task === 'lint') {
      const { candidates, total } = await suppressionCandidates(root);
      const [burndown] = candidates;
      if (burndown) {
        return emit({
          task,
          mode: 'B',
          rule: burndown.rule,
          target: path.relative(root, burndown.file),
          suppressionsFile: path.relative(burndown.dir, burndown.suppressionsFile) || SUPPRESSIONS_FILE,
          workingDirectory: path.relative(root, burndown.dir) || '.',
          remainingSuppressions: total,
          rationale: `${burndown.rule} is enforced with ${burndown.count} suppressed ${burndown.count === 1 ? 'violation' : 'violations'} left in this file, the smallest remaining group. ${total} ${total === 1 ? 'suppression remains' : 'suppressions remain'} across the repository.`
        });
      }
      const [rule] = await disabledRules(root);
      const packages = await lintPackageContexts(root);
      if (!rule || packages.length === 0) continue;
      return emit({
        task,
        mode: 'A',
        rule,
        target: ESLINT_CONFIG,
        packages,
        rationale: `${rule} is the easiest rule still disabled under the incremental-adoption marker`
      });
    }

    if (task === 'bug') {
      const [best] = await bugCandidates(root);
      if (!best) continue;
      return emit({
        task,
        target: `${path.relative(root, best.file)}:${best.line}`,
        title: best.title,
        rationale: `quarantined ${best.kind} test "${best.title}" describes behavior that should work but does not`
      });
    }
  }

  fail(
    'no eligible task found. Coverage may be at threshold, no rules are left to adopt, and no quarantined tests remain.'
  );
}

await main();
