#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

const BRANCH_PREFIX = 'topic/dependencies/';
const REMOTE_BRANCH_PREFIX = 'refs/remotes/origin/' + BRANCH_PREFIX;
const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const RUNTIME_SECTIONS = new Set(['dependencies', 'peerDependencies', 'optionalDependencies']);
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.wireit']);
const FIRST_PARTY_ACTION_PATTERN = /^actions\/[^/]+$/i;
const MAX_BUFFER = 100 * 1024 * 1024;

const GUARDRAILS = {
  branchPrefix: BRANCH_PREFIX,
  dependencyUnitsPerRun: 1,
  majorUpdates: false,
  prereleases: false,
  preOneMinorUpdates: false
};

function fail(reason, extra = {}) {
  console.log(JSON.stringify({ collected: false, reason, ...extra }, null, 2));
  process.exit(1);
}

function emit(result) {
  console.log(JSON.stringify({ collected: true, guardrails: GUARDRAILS, ...result }, null, 2));
}

async function command(program, argv, { cwd, allowedExitCodes = [0] } = {}) {
  try {
    const result = await run(program, argv, {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' },
      maxBuffer: MAX_BUFFER
    });
    return { ...result, exitCode: 0 };
  } catch (error) {
    if (typeof error?.code === 'number' && allowedExitCodes.includes(error.code)) {
      return {
        stdout: String(error.stdout ?? ''),
        stderr: String(error.stderr ?? ''),
        exitCode: error.code
      };
    }
    const detail = String(error?.stderr ?? error?.message ?? error).trim();
    throw new Error(program + ' ' + argv.join(' ') + ' failed' + (detail ? ': ' + detail : ''));
  }
}

async function git(argv, cwd, allowedExitCodes = [0]) {
  return command('git', argv, { cwd, allowedExitCodes });
}

function parseJsonObject(output, source) {
  try {
    const parsed = JSON.parse(output || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('expected a JSON object');
    }
    return parsed;
  } catch (error) {
    throw new Error('could not parse ' + source + ' JSON: ' + error.message);
  }
}

function parseVersion(version) {
  if (typeof version !== 'string') return null;
  const match = /^(\d+)\.(\d+)\.(\d+)(?:\+[0-9A-Za-z.-]+)?$/.exec(version);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function compareVersions(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

export function assessVersion(current, target) {
  const from = parseVersion(current);
  const to = parseVersion(target);
  if (!from || !to) return { eligible: false, reason: 'unsupported-version' };
  if (compareVersions(to, from) <= 0) return { eligible: false, reason: 'not-newer' };
  if (to.major !== from.major) return { eligible: false, reason: 'major-update' };
  if (from.major === 0 && to.minor !== from.minor) {
    return { eligible: false, reason: 'pre-1.0-minor-update' };
  }
  return { eligible: true, updateType: to.minor === from.minor ? 'patch' : 'minor' };
}

export function versionOptions(current, data) {
  const seen = new Set();
  return ['wanted', 'latest']
    .map(source => ({ source, version: data[source] }))
    .filter(option => {
      if (typeof option.version !== 'string' || seen.has(option.version)) return false;
      seen.add(option.version);
      return true;
    })
    .map(option => ({ ...option, ...assessVersion(current, option.version) }));
}

export function isEligibleGitHubAction(name) {
  return typeof name === 'string' && FIRST_PARTY_ACTION_PATTERN.test(name);
}

export function scopeForManifest(file, allowedScopes) {
  const normalized = file.split(path.sep).join('/');
  if (normalized === 'package.json') return 'ci';
  if (normalized.startsWith('projects/internals/')) return 'ci';
  if (normalized.startsWith('projects/site/')) return allowedScopes.has('docs') ? 'docs' : null;
  if (normalized.startsWith('projects/starters/')) return allowedScopes.has('starters') ? 'starters' : null;

  const match = /^projects\/([^/]+)\//.exec(normalized);
  if (!match) return null;
  return allowedScopes.has(match[1]) ? match[1] : null;
}

export function classifyUsages(usages) {
  if (usages.length === 0) return { blockedReason: 'no-direct-declaration' };

  const invalid = usages.filter(usage => !usage.root && !usage.internal && !usage.scope);
  if (invalid.length > 0) {
    return {
      blockedReason: 'invalid-project-scope',
      files: [...new Set(invalid.map(usage => usage.file))].sort()
    };
  }

  const runtimeScopes = new Set(usages.filter(usage => usage.runtime).map(usage => usage.scope));
  if (runtimeScopes.size > 1) {
    return { blockedReason: 'multiple-runtime-scopes', scopes: [...runtimeScopes].sort() };
  }

  const projectScopes = new Set(usages.map(usage => usage.scope).filter(Boolean));
  if (projectScopes.size > 1) {
    return { blockedReason: 'multiple-project-scopes', scopes: [...projectScopes].sort() };
  }

  if (runtimeScopes.size === 1) {
    const scope = [...runtimeScopes][0];
    return { classification: 'runtime', recommendedCommit: { type: 'fix', scope } };
  }

  const generalTooling = usages.some(usage => usage.root || usage.internal);
  if (generalTooling) {
    return { classification: 'general-tooling', recommendedCommit: { type: 'chore', scope: 'ci' } };
  }

  const scope = [...projectScopes][0];
  return { classification: 'project-dev', recommendedCommit: { type: 'chore', scope } };
}

export function prMatchesDependency(pr, name) {
  const lowerName = name.toLowerCase();
  const escapedName = lowerName.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
  const title = String(pr.title ?? '').toLowerCase();
  const titlePattern = new RegExp('(?:bump|update|upgrade)\\s+(?:the\\s+)?' + escapedName + '(?=\\s|$|[:@])');
  const normalizedName = lowerName.replace(/^@/, '').replace(/[^a-z0-9]+/g, '/');
  const normalizedHead =
    '/' +
    String(pr.headRefName ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '/') +
    '/';
  return (
    titlePattern.test(title) ||
    title.includes('\x60' + lowerName + '\x60') ||
    normalizedHead.includes('/' + normalizedName + '/')
  );
}

async function walk(root, predicate) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file, predicate)));
    else if (entry.isFile() && predicate(entry.name)) files.push(file);
  }
  return files;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    throw new Error('could not parse ' + file + ': ' + error.message);
  }
}

async function loadAllowedScopes(root) {
  const configFile = path.join(root, 'commitlint.config.js');
  const config = (await import(pathToFileURL(configFile).href + '?dependency-collector')).default;
  const scopes = config?.rules?.['scope-enum']?.[2];
  if (!Array.isArray(scopes)) throw new Error('could not read allowed scopes from commitlint.config.js');
  return new Set(scopes);
}

async function collectPackageUsages(root, allowedScopes) {
  const packageFiles = [
    path.join(root, 'package.json'),
    ...(await walk(path.join(root, 'projects'), name => name === 'package.json'))
  ];
  const usages = new Map();

  for (const packageFile of packageFiles) {
    const manifest = await readJson(packageFile);
    const relativeFile = path.relative(root, packageFile).split(path.sep).join('/');
    const rootPackage = relativeFile === 'package.json';
    const internal = relativeFile.startsWith('projects/internals/');
    const scope = scopeForManifest(relativeFile, allowedScopes);

    for (const section of DEPENDENCY_SECTIONS) {
      for (const [name, specifier] of Object.entries(manifest[section] ?? {})) {
        const entries = usages.get(name) ?? [];
        entries.push({
          dependencyName: name,
          file: relativeFile,
          packageName: manifest.name ?? path.dirname(relativeFile),
          section,
          specifier: String(specifier),
          root: rootPackage,
          internal,
          runtime: !rootPackage && !internal && RUNTIME_SECTIONS.has(section),
          scope
        });
        usages.set(name, entries);
      }
    }
  }
  return usages;
}

async function collectActionUsages(root) {
  const usages = new Map();
  const files = await walk(path.join(root, '.github'), name => /\.ya?ml$/.test(name));
  for (const file of files) {
    const relativeFile = path.relative(root, file).split(path.sep).join('/');
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/uses:\s*["']?([^@\s"']+)@([^\s"'#]+)/g)) {
      const entries = usages.get(match[1]) ?? [];
      entries.push({ dependencyName: match[1], file: relativeFile, section: 'uses', specifier: match[2] });
      usages.set(match[1], entries);
    }
  }
  return usages;
}

function unsupportedSpecifier(specifier) {
  return /^(?:workspace:|npm:|file:|link:|https?:|git(?:\+|:)|github:)/.test(specifier);
}

export function candidateFacts(name, data, usages, pullRequests, kind = 'npm') {
  const options = versionOptions(data.current, data);
  const classification =
    kind === 'npm'
      ? classifyUsages(usages)
      : { classification: 'general-tooling', recommendedCommit: { type: 'chore', scope: 'ci' } };
  const pullRequest = pullRequests.find(pr => prMatchesDependency(pr, name));
  const blockedReasons = [];

  if (data.isDeprecated) blockedReasons.push('deprecated');
  if (kind === 'github-action' && !isEligibleGitHubAction(name)) {
    blockedReasons.push('unsupported-github-action-owner');
  }
  if (options.length === 0 || options.every(option => !option.eligible)) {
    blockedReasons.push('no-eligible-reported-target');
  }
  if (classification.blockedReason) blockedReasons.push(classification.blockedReason);
  if (usages.some(usage => unsupportedSpecifier(usage.specifier))) blockedReasons.push('unsupported-specifier');
  if (pullRequest) blockedReasons.push('open-pull-request');

  return {
    name,
    kind,
    current: data.current,
    versionOptions: options,
    mechanicallyEligible: blockedReasons.length === 0,
    blockedReasons: [...new Set(blockedReasons)],
    declarations: usages,
    classification: classification.classification ?? null,
    recommendedCommit: classification.recommendedCommit ?? null,
    openPullRequest: pullRequest ? { number: pullRequest.number, title: pullRequest.title, url: pullRequest.url } : null
  };
}

function compareCandidates(a, b) {
  const aMinor = Number(!a.versionOptions.some(option => option.eligible && option.updateType === 'patch'));
  const bMinor = Number(!b.versionOptions.some(option => option.eligible && option.updateType === 'patch'));
  const aFiles = new Set(a.declarations.map(declaration => declaration.file)).size;
  const bFiles = new Set(b.declarations.map(declaration => declaration.file)).size;
  return (
    aMinor - bMinor ||
    Number(a.recommendedCommit?.scope === 'ci') - Number(b.recommendedCommit?.scope === 'ci') ||
    aFiles - bFiles ||
    a.declarations.length - b.declarations.length ||
    a.name.localeCompare(b.name) ||
    a.kind.localeCompare(b.kind)
  );
}

async function inFlightBranches(root) {
  await git(['fetch', '--prune', '--quiet', 'origin'], root);
  let defaultBranch = 'origin/main';
  try {
    const { stdout } = await git(['symbolic-ref', 'refs/remotes/origin/HEAD'], root);
    defaultBranch = stdout.trim().replace('refs/remotes/', '');
  } catch {
    // Fall back to origin/main.
  }

  const { stdout } = await git(['for-each-ref', '--format=%(refname:short) %(objectname)', REMOTE_BRANCH_PREFIX], root);
  const inFlight = [];
  for (const line of stdout.trim().split('\n').filter(Boolean)) {
    const [name, sha] = line.split(' ');
    const result = await git(['merge-base', '--is-ancestor', sha, defaultBranch], root, [0, 1]);
    if (result.exitCode === 1) inFlight.push(name.replace(/^origin\//, ''));
  }
  return inFlight;
}

async function openPullRequests(root) {
  const { stdout } = await command(
    'gh',
    ['pr', 'list', '--state', 'open', '--limit', '200', '--json', 'number,title,url,headRefName'],
    { cwd: root }
  );
  const parsed = JSON.parse(stdout || '[]');
  if (!Array.isArray(parsed)) throw new Error('could not parse gh pull request JSON');
  return parsed;
}

async function discoverPnpm(root) {
  const { stdout } = await command(
    'mise',
    ['exec', '--', 'pnpm', 'outdated', '--recursive', '--format', 'json', '--include-github-actions', '--no-color'],
    { cwd: root, allowedExitCodes: [0, 1] }
  );
  return parseJsonObject(stdout, 'pnpm outdated');
}

async function discoverMise(root) {
  const { stdout } = await command('mise', ['outdated', '--local', '--bump', '--json'], {
    cwd: root,
    allowedExitCodes: [0, 1]
  });
  return parseJsonObject(stdout, 'mise outdated');
}

async function main() {
  const { stdout: rootOutput } = await git(['rev-parse', '--show-toplevel'], process.cwd());
  const root = rootOutput.trim();
  const inFlight = await inFlightBranches(root);
  if (inFlight.length > 0) {
    fail('an unmerged dependency-agent branch already exists', {
      errorType: 'guardrail',
      branches: inFlight
    });
  }

  const allowedScopes = await loadAllowedScopes(root);
  const [packageUsages, actionUsages, pnpmOutdated, miseOutdated, pullRequests] = await Promise.all([
    collectPackageUsages(root, allowedScopes),
    collectActionUsages(root),
    discoverPnpm(root),
    discoverMise(root),
    openPullRequests(root)
  ]);

  const candidates = Object.entries(pnpmOutdated).map(([name, data]) => {
    const action = data.dependencyType === 'githubAction';
    return candidateFacts(
      name,
      data,
      action ? (actionUsages.get(name) ?? []) : (packageUsages.get(name) ?? []),
      pullRequests,
      action ? 'github-action' : 'npm'
    );
  });
  candidates.push(
    ...Object.entries(miseOutdated).map(([name, data]) =>
      candidateFacts(
        name,
        data,
        [{ dependencyName: name, file: 'mise.toml', section: 'tools', specifier: String(data.requested ?? '') }],
        pullRequests,
        'mise'
      )
    )
  );
  const eligible = candidates.filter(candidate => candidate.mechanicallyEligible).sort(compareCandidates);
  const blocked = candidates
    .filter(candidate => !candidate.mechanicallyEligible)
    .map(candidate => ({ name: candidate.name, kind: candidate.kind, reasons: candidate.blockedReasons }))
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));

  emit({
    candidates: eligible,
    blockedCandidates: blocked,
    summary: {
      total: candidates.length,
      mechanicallyEligible: eligible.length,
      blocked: blocked.length
    }
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch(error => {
    fail(error.message, { errorType: 'environment' });
  });
}
