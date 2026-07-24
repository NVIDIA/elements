#!/usr/bin/env node

import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REPOSITORY = 'NVIDIA/elements';
const REPOSITORY_URL = `https://github.com/${REPOSITORY}`;
const MAX_MARKDOWN_FILES = 12;
const RELEASE_TAG_PATTERN = /^(@nvidia-elements\/(.+))-v(.+)$/;
const RELEASE_COMMIT_PATTERN = /^chore\(release\):/i;
const CONVENTIONAL_COMMIT_PATTERN =
  /^(feat|fix|perf|docs|refactor|chore|build|ci|test|style|revert)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i;

function compactError(error) {
  return (error instanceof Error ? error.message : String(error)).replace(/\s+/g, ' ').trim();
}

function readOptionValue(argv, index, name) {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value.`);
  }

  return value;
}

function parseArgs(argv) {
  const options = {
    includePrereleases: false,
    json: false,
    repoDir: process.cwd()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    switch (argument) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--include-prereleases':
        options.includePrereleases = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--month':
        options.month = readOptionValue(argv, index, '--month');
        index += 1;
        break;
      case '--repo-dir':
        options.repoDir = readOptionValue(argv, index, '--repo-dir');
        index += 1;
        break;
      default:
        throw new Error(`Unknown option: ${argument}`);
    }
  }

  return options;
}

function parseMonth(value) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);

  if (!match) {
    throw new Error(`Invalid month: ${value}. Use YYYY-MM.`);
  }

  return { monthIndex: Number(match[2]) - 1, year: Number(match[1]) };
}

function getPeriod(options, now = new Date()) {
  const reference = new Date(now);

  if (Number.isNaN(reference.getTime())) {
    throw new Error(`Invalid current date: ${now}`);
  }

  const defaultMonth = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1));
  const selection =
    options.month ?? `${defaultMonth.getUTCFullYear()}-${String(defaultMonth.getUTCMonth() + 1).padStart(2, '0')}`;
  const { monthIndex, year } = parseMonth(selection);
  const since = new Date(Date.UTC(year, monthIndex, 1));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1) - 1);

  if (since > reference) {
    throw new Error('--month must not be in the future.');
  }

  const until = reference < monthEnd ? reference : monthEnd;
  return { since: since.toISOString(), until: until.toISOString() };
}

function formatUtcDate(date, options) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date);
}

function formatMonth(period) {
  const since = new Date(period.since);
  return formatUtcDate(since, { month: 'long', year: 'numeric' });
}

function getPageMetadata(period, now = new Date()) {
  const since = new Date(period.since);
  const publicationDate = new Date(now);

  if (Number.isNaN(publicationDate.getTime())) {
    throw new Error(`Invalid publication date: ${now}`);
  }

  const month = String(since.getUTCMonth() + 1).padStart(2, '0');
  const year = since.getUTCFullYear();
  const slug = `${month}-${year}`;
  const date = publicationDate.toISOString().slice(0, 10);

  return {
    date,
    dateModified: date,
    datePublished: date,
    filePath: `projects/site/src/docs/whats-new/${slug}.md`,
    layout: 'whats-new.11ty.js',
    tags: ['whats-new', 'updates'],
    title: `What’s new in NVIDIA Elements: ${formatMonth(period)}`,
    updateMonth: since.toISOString().slice(0, 10),
    url: `/docs/whats-new/${slug}/`
  };
}

function parseElementsTag(tagName) {
  const match = tagName.match(RELEASE_TAG_PATTERN);

  return match
    ? {
        packageName: match[1],
        packageSlug: match[2],
        version: match[3]
      }
    : undefined;
}

function parseConventionalCommit(subject, message = subject) {
  const match = subject.match(CONVENTIONAL_COMMIT_PATTERN);

  return {
    breaking: Boolean(match?.[3]) || /(^|\n)BREAKING[ -]CHANGE:/i.test(message),
    description: match?.[4] ?? subject,
    scope: match?.[2]?.toLowerCase(),
    type: match?.[1]?.toLowerCase()
  };
}

function extractChangelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const headingPattern = /^##\s+(?:<small>)?([^\s<]+)\s+\((\d{4}-\d{2}-\d{2})\)(?:<\/small>)?\s*$/;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(headingPattern);

    if (match?.[1] !== version) {
      continue;
    }

    let end = index + 1;

    while (end < lines.length && !/^##\s+/.test(lines[end])) {
      end += 1;
    }

    return {
      date: match[2],
      notes: lines
        .slice(index + 1, end)
        .join('\n')
        .trim()
    };
  }

  return undefined;
}

function parseReleaseNoteCommits(notes, repository = REPOSITORY) {
  const escapedRepository = repository.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkPattern = new RegExp(
    `\\[([0-9a-f]{7,40})\\]\\((https://github\\.com/${escapedRepository}/commit/([0-9a-f]{7,40}))\\)`,
    'gi'
  );
  const commits = [];

  for (const line of notes.split(/\r?\n/)) {
    for (const match of line.matchAll(linkPattern)) {
      const subject = line
        .replace(/^\s*[-*+]\s+/, '')
        .replace(match[0], '')
        .replace(/[\s()]+$/g, '')
        .trim();

      commits.push({
        sha: match[3].toLowerCase(),
        subject,
        url: match[2]
      });
    }
  }

  return commits;
}

async function runGit(args, cwd) {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', LC_ALL: 'C' },
    maxBuffer: 20 * 1024 * 1024,
    timeout: 30_000
  });

  return stdout;
}

async function findGitRoot(repoDir) {
  try {
    return (await runGit(['rev-parse', '--show-toplevel'], path.resolve(repoDir))).trim();
  } catch {
    return undefined;
  }
}

async function readFileAtTag(tagName, filePath, gitRoot) {
  try {
    return await runGit(['show', `${tagName}:${filePath}`], gitRoot);
  } catch {
    return undefined;
  }
}

async function readPackageJsonAtTag(tagName, packageJsonPath, gitRoot) {
  const source = await readFileAtTag(tagName, packageJsonPath, gitRoot);

  if (!source) {
    return undefined;
  }

  try {
    return JSON.parse(source);
  } catch {
    return undefined;
  }
}

async function findPackageMetadataAtTag({ gitRoot, packageName, packageSlug, tagName }) {
  const directPackageJsonPath = `projects/${packageSlug}/package.json`;
  const directPackageJson = await readPackageJsonAtTag(tagName, directPackageJsonPath, gitRoot);

  if (directPackageJson?.name === packageName) {
    return {
      changelogPath: `projects/${packageSlug}/CHANGELOG.md`,
      packageJson: directPackageJson,
      packageJsonPath: directPackageJsonPath
    };
  }

  const files = await runGit(['ls-tree', '-r', '--name-only', tagName, '--', 'projects'], gitRoot);
  const packageJsonPaths = files.split('\n').filter(filePath => /^projects\/[^/]+\/package\.json$/.test(filePath));

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = await readPackageJsonAtTag(tagName, packageJsonPath, gitRoot);

    if (packageJson?.name === packageName) {
      return {
        changelogPath: path.posix.join(path.posix.dirname(packageJsonPath), 'CHANGELOG.md'),
        packageJson,
        packageJsonPath
      };
    }
  }

  return undefined;
}

function isInPeriod(timestamp, period) {
  const value = Date.parse(timestamp);
  return value >= Date.parse(period.since) && value <= Date.parse(period.until);
}

function isPrerelease(version) {
  return /(?:^|[.-])(alpha|beta|rc)(?:[.-]|\d|$)/i.test(version);
}

function compareReleaseDates(left, right) {
  return Date.parse(left.releasedAt) - Date.parse(right.releasedAt) || left.tagName.localeCompare(right.tagName);
}

async function collectGitReleases({ gitRoot, includePrereleases, period }) {
  const output = await runGit(
    ['for-each-ref', '--sort=-creatordate', '--format=%(refname:strip=2)%09%(creatordate:iso-strict)', 'refs/tags'],
    gitRoot
  );
  const releases = [];
  const warnings = [];

  for (const row of output.trim().split('\n').filter(Boolean)) {
    const [tagName, rawReleasedAt] = row.split('\t');
    const parsedTag = parseElementsTag(tagName);

    if (!parsedTag) {
      continue;
    }

    const releasedAt = new Date(rawReleasedAt).toISOString();

    if (!isInPeriod(releasedAt, period) || (!includePrereleases && isPrerelease(parsedTag.version))) {
      continue;
    }

    const commitSha = (await runGit(['rev-list', '-n', '1', tagName], gitRoot)).trim();
    const metadata = await findPackageMetadataAtTag({ gitRoot, tagName, ...parsedTag });
    let changelogDate;
    let notes;
    let notesSource = 'tag-message';

    if (!metadata) {
      warnings.push(`Skipped ${tagName} because it does not contain package metadata for ${parsedTag.packageName}.`);
      continue;
    }

    if (metadata.packageJson.version !== parsedTag.version) {
      warnings.push(
        `Skipped ${tagName} because it points to package version ${metadata.packageJson.version ?? 'unknown'} instead of ${parsedTag.version}.`
      );
      continue;
    }

    const changelog = await readFileAtTag(tagName, metadata.changelogPath, gitRoot);
    const section = changelog ? extractChangelogSection(changelog, parsedTag.version) : undefined;

    if (section) {
      changelogDate = section.date;
      notes = section.notes;
      notesSource = 'tagged-changelog';
    } else {
      warnings.push(`${tagName} does not contain a ${parsedTag.version} changelog section.`);
    }

    if (notes === undefined) {
      notes = (await runGit(['show', '-s', '--format=%b', tagName, '--'], gitRoot)).trim();
    }

    releases.push({
      ...parsedTag,
      changelogDate,
      changelogPath: metadata.changelogPath,
      commitSha,
      notes,
      notesSource,
      packageJsonPath: metadata.packageJsonPath,
      packageJsonVersion: metadata.packageJson.version,
      releasedAt,
      tagName,
      url: `${REPOSITORY_URL}/releases/tag/${encodeURIComponent(tagName)}`,
      versionMatchesTag: true
    });
  }

  releases.sort(compareReleaseDates);

  return { releases, warnings };
}

async function loadGitCommit(sha, gitRoot) {
  try {
    const output = await runGit(
      ['show', '--no-ext-diff', '--no-renames', '--numstat', '--format=%H%x00%aI%x00%an%x00%B%x00', sha, '--'],
      gitRoot
    );
    const [fullSha, authoredAt, author, message, numstat = ''] = output.split('\0');
    const [subject = '', ...bodyLines] = message.trim().split(/\r?\n/);
    const files = numstat
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [rawAdditions, rawDeletions, ...pathParts] = line.split('\t');

        return {
          additions: rawAdditions === '-' ? undefined : Number(rawAdditions),
          deletions: rawDeletions === '-' ? undefined : Number(rawDeletions),
          path: pathParts.join('\t')
        };
      });

    return {
      authoredAt,
      author,
      body: bodyLines.join('\n').trim(),
      files,
      message: message.trim(),
      sha: fullSha,
      subject
    };
  } catch {
    return undefined;
  }
}

function mergeChange(target, source) {
  target.releaseTags = [...new Set([...(target.releaseTags ?? []), ...(source.releaseTags ?? [])])];
  target.subject ||= source.subject;
  target.url ||= source.url;

  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && !['releaseTags', 'subject', 'url'].includes(key)) {
      target[key] = value;
    }
  }

  return target;
}

async function collectChanges({ gitRoot, releases, loadCommit = loadGitCommit }) {
  const candidates = new Map();

  for (const release of releases) {
    for (const commit of parseReleaseNoteCommits(release.notes)) {
      const existing = candidates.get(commit.sha) ?? { ...commit, releaseTags: [] };
      mergeChange(existing, { ...commit, releaseTags: [release.tagName] });
      candidates.set(commit.sha, existing);
    }
  }

  const changes = new Map();
  let unenrichedCount = 0;

  for (const candidate of candidates.values()) {
    if (RELEASE_COMMIT_PATTERN.test(candidate.subject)) {
      continue;
    }

    const local = await loadCommit(candidate.sha, gitRoot);
    const record = {
      ...candidate,
      ...(local ?? {}),
      url: candidate.url || `${REPOSITORY_URL}/commit/${candidate.sha}`
    };

    if (!local) {
      unenrichedCount += 1;
    }

    Object.assign(record, parseConventionalCommit(record.subject, record.message));

    if (RELEASE_COMMIT_PATTERN.test(record.subject)) {
      continue;
    }

    const key = record.sha.toLowerCase();
    const existing = changes.get(key);
    changes.set(key, existing ? mergeChange(existing, record) : record);
  }

  return { changes: [...changes.values()], unenrichedCount };
}

async function createEvidence(options, { now = new Date() } = {}) {
  const period = getPeriod(options, now);
  const gitRoot = await findGitRoot(options.repoDir);

  if (!gitRoot) {
    throw new Error('Run this script from an NVIDIA Elements Git clone or pass --repo-dir.');
  }

  const { releases, warnings } = await collectGitReleases({
    gitRoot,
    includePrereleases: options.includePrereleases,
    period
  });
  const { changes, unenrichedCount } = await collectChanges({ gitRoot, releases });

  if (releases.length > 0 && changes.length === 0) {
    warnings.push('The selected changelog sections did not contain commit links.');
  }

  if (unenrichedCount > 0) {
    warnings.push(`${unenrichedCount} changelog commit(s) were not available in the local clone.`);
  }

  return {
    changes,
    generatedAt: new Date(now).toISOString(),
    gitRoot,
    page: getPageMetadata(period, now),
    period,
    releasePageUrl: `${REPOSITORY_URL}/releases`,
    releases,
    repository: REPOSITORY,
    source: 'local-git-tags-and-changelogs',
    warnings
  };
}

function formatFile(file) {
  const additions = file.additions === undefined ? '?' : file.additions;
  const deletions = file.deletions === undefined ? '?' : file.deletions;
  return `\`${file.path}\` (+${additions}/-${deletions})`;
}

function formatMarkdown(evidence) {
  const lines = [
    '# NVIDIA Elements release evidence',
    '',
    `- Period: ${evidence.period.since} through ${evidence.period.until}`,
    `- Source: ${evidence.source}`,
    `- Releases: ${evidence.releases.length}`,
    `- Unique non-release commits: ${evidence.changes.length}`,
    `- Release page: ${evidence.releasePageUrl}`,
    `- Docs page: ${evidence.page.filePath}`,
    `- Docs title: ${evidence.page.title}`
  ];

  if (evidence.warnings.length > 0) {
    lines.push('', '## Warnings', '', ...evidence.warnings.map(warning => `- ${warning}`));
  }

  if (evidence.releases.length === 0) {
    lines.push('', 'No NVIDIA Elements release tags were found in this period.');
    return `${lines.join('\n')}\n`;
  }

  lines.push('', '## Releases');

  for (const release of evidence.releases) {
    lines.push(
      '',
      `### ${release.packageName} ${release.version}`,
      '',
      `- Tagged: ${release.releasedAt}`,
      `- Tag: ${release.tagName}`,
      `- Package metadata: ${release.packageJsonPath ?? 'not found'} (${release.packageJsonVersion ?? 'unknown'})`,
      `- Notes source: ${release.notesSource}${release.changelogPath ? ` (${release.changelogPath})` : ''}`,
      `- URL: ${release.url}`
    );

    if (release.notes.trim()) {
      lines.push('', release.notes.trim());
    }
  }

  lines.push('', '## Unique commit evidence');

  for (const change of evidence.changes) {
    const shortSha = change.sha.slice(0, 7);
    lines.push(
      '',
      `### ${change.subject || shortSha}`,
      '',
      `- Commit: ${change.url}`,
      `- SHA: ${change.sha}`,
      `- Included by: ${change.releaseTags.join(', ')}`,
      `- Classification: ${[change.type, change.scope].filter(Boolean).join(' / ') || 'unclassified'}${
        change.breaking ? ' / BREAKING' : ''
      }`
    );

    if (change.author || change.authoredAt) {
      lines.push(`- Authored: ${[change.author, change.authoredAt].filter(Boolean).join(' — ')}`);
    }

    if (change.body) {
      lines.push(`- Commit details: ${change.body.replace(/\s+/g, ' ').trim()}`);
    }

    if (change.files?.length) {
      const visibleFiles = change.files.slice(0, MAX_MARKDOWN_FILES).map(formatFile).join(', ');
      const remainder = change.files.length - MAX_MARKDOWN_FILES;
      lines.push(`- Changed files: ${visibleFiles}${remainder > 0 ? `, plus ${remainder} more` : ''}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function getHelp() {
  return `Usage: node .agents/skills/summarize-releases/scripts/collect-releases.js [options]

Collect release and commit evidence from local NVIDIA Elements tags and changelogs.

Options:
  --month <YYYY-MM>        Calendar month to collect (default: previous month)
  --include-prereleases    Include prereleases
  --repo-dir <path>        NVIDIA Elements clone (default: current directory)
  --json                   Print structured JSON instead of Markdown
  --help                   Show this help

This script does not use the GitHub API or require a token.
`;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      process.stdout.write(getHelp());
      return;
    }

    const evidence = await createEvidence(options);
    process.stdout.write(options.json ? `${JSON.stringify(evidence, null, 2)}\n` : formatMarkdown(evidence));
  } catch (error) {
    process.stderr.write(`Error: ${compactError(error)}\n`);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await main();
}
