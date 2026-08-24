#!/usr/bin/env node
import { execFile } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const BRANCH_PREFIX = 'topic/dependencies/';
const SHARED_FILES = new Set(['pnpm-workspace.yaml', 'pnpm-lock.yaml', 'NOTICE.md']);
const PROHIBITED_PATH = /(?:^|\/)(?:src|test|tests|snapshots|__snapshots__)(?:\/|$)|\.(?:test|spec)(?:\.|$)/;

function fail(reason, extra = {}) {
  console.log(JSON.stringify({ verified: false, reason, ...extra }, null, 2));
  process.exit(1);
}

function argument(name) {
  return process.argv
    .slice(2)
    .find(value => value.startsWith('--' + name + '='))
    ?.slice(name.length + 3);
}

function projectRoot(scope) {
  if (scope === 'docs') return 'projects/site/';
  if (scope === 'starters') return 'projects/starters/';
  return 'projects/' + scope + '/';
}

function pathAllowed(file, scope) {
  if (SHARED_FILES.has(file)) return true;
  if (scope === 'ci') {
    return !file.includes('/') || file.startsWith('.github/') || file.startsWith('projects/internals/');
  }
  return file.startsWith(projectRoot(scope));
}

function dependencyArtifactAllowed(file, scope) {
  if (scope === 'ci' || SHARED_FILES.has(file)) return true;

  const root = projectRoot(scope);
  if (!file.startsWith(root)) return false;
  const relativeFile = file.slice(root.length);
  if (relativeFile === 'package.json' || relativeFile === 'NOTICE.md') return true;
  return scope === 'starters' && /^[^/]+\/(?:package\.json|NOTICE\.md)$/.test(relativeFile);
}

export function verifyUpdate({ files, branch, type, scope, allowedScopes }) {
  const errors = [];
  if (!['fix', 'chore'].includes(type)) errors.push('commit type must be fix or chore');
  if (!allowedScopes.has(scope)) errors.push('scope is not allowed by commitlint');
  if (type === 'fix' && scope === 'ci') errors.push('runtime fixes cannot use the ci scope');
  if (!branch.startsWith(BRANCH_PREFIX + scope + '/')) {
    errors.push('branch must start with ' + BRANCH_PREFIX + scope + '/');
  }
  if (files.length === 0) errors.push('no changed files found');

  const prohibitedFiles = files.filter(file => PROHIBITED_PATH.test(file));
  if (prohibitedFiles.length > 0) errors.push('source, test, or snapshot files changed');
  const outsideScope = files.filter(file => !pathAllowed(file, scope));
  if (outsideScope.length > 0) errors.push('files outside the commit scope changed');
  const unrecognizedFiles = files.filter(file => !dependencyArtifactAllowed(file, scope));
  if (unrecognizedFiles.length > 0) errors.push('files outside the dependency artifact allowlist changed');

  return {
    verified: errors.length === 0,
    errors,
    type,
    scope,
    branch,
    changedFiles: files,
    prohibitedFiles,
    outsideScope,
    unrecognizedFiles
  };
}

async function git(argv, cwd) {
  const { stdout } = await run('git', argv, { cwd, encoding: 'utf8' });
  return stdout.trim();
}

async function main() {
  const type = argument('type');
  const scope = argument('scope');
  if (!type || !scope) fail('usage: verify-update.js --type=<fix|chore> --scope=<scope>');

  const root = await git(['rev-parse', '--show-toplevel'], process.cwd());
  const config = (await import(pathToFileURL(path.join(root, 'commitlint.config.js')).href + '?dependency-verifier'))
    .default;
  const scopes = config?.rules?.['scope-enum']?.[2];
  if (!Array.isArray(scopes)) fail('could not read allowed scopes from commitlint.config.js');

  const [branch, tracked, untracked] = await Promise.all([
    git(['branch', '--show-current'], root),
    git(['diff', '--name-only', 'HEAD'], root),
    git(['ls-files', '--others', '--exclude-standard'], root)
  ]);
  const files = [...new Set([...tracked.split('\n'), ...untracked.split('\n')].filter(Boolean))].sort();
  const result = verifyUpdate({ files, branch, type, scope, allowedScopes: new Set(scopes) });
  if (!result.verified) fail('dependency update verification failed', result);
  console.log(JSON.stringify(result, null, 2));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch(error => fail(error.message));
}
