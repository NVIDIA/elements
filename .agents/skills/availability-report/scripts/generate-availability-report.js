#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const PACKAGES = [
  '@nvidia-elements/core',
  '@nvidia-elements/code',
  '@nvidia-elements/forms',
  '@nvidia-elements/markdown',
  '@nvidia-elements/monaco',
  '@nvidia-elements/styles',
  '@nvidia-elements/themes'
];

const DOCS_URLS = [
  'https://nvidia.github.io/elements/',
  'https://nvidia.github.io/elements/docs/integrations/installation/',
  'https://nvidia.github.io/elements/docs/integrations/',
  'https://nvidia.github.io/elements/docs/elements/button/',
  'https://nvidia.github.io/elements/docs/patterns/',
  'https://nvidia.github.io/elements/docs/patterns/dashboard/'
];

const COMMAND_TIMEOUT_MS = 120_000;
const DOCS_TIMEOUT_MS = 30_000;
const MAX_COMMAND_OUTPUT_LENGTH = 600;
const STATUS_LABELS = {
  FAIL: '❌',
  PASS: '✅',
  WARN: '⚠️'
};

function compactText(value, maxLength = MAX_COMMAND_OUTPUT_LENGTH) {
  const text = value instanceof Error ? value.message : value === undefined || value === null ? '' : String(value);
  const compacted = text.replace(/\s+/g, ' ').trim();
  return compacted.length <= maxLength ? compacted : `${compacted.slice(0, maxLength - 1)}…`;
}

function getErrorReason(error) {
  const { code, message, signal, stderr, stdout } = error && typeof error === 'object' ? error : {};
  const codeText = compactText(code);
  const signalText = compactText(signal);
  const details = [
    compactText(stderr),
    compactText(stdout),
    compactText(message),
    codeText && `exit ${codeText}`,
    signalText && `signal ${signalText}`
  ].filter(Boolean);

  return details.at(0) ?? 'command failed';
}

function createFailure(reason) {
  return { ok: false, reason };
}

async function createPackageMapAsync(packageNames, getValue) {
  return Object.fromEntries(
    await Promise.all(packageNames.map(async packageName => [packageName, await getValue(packageName)]))
  );
}

function createFailedPackageMap(packageNames, reason) {
  return Object.fromEntries(packageNames.map(packageName => [packageName, createFailure(reason)]));
}

function createFailedNpmPackageChecks(packageNames, notes, reason) {
  return {
    installChecks: createFailedPackageMap(packageNames, reason),
    notes,
    npmChecks: createFailedPackageMap(packageNames, reason),
    resolveChecks: createFailedPackageMap(packageNames, reason)
  };
}

async function runCommand(command, args, { cwd, timeoutMs = COMMAND_TIMEOUT_MS } = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
      timeout: timeoutMs
    });

    return { ok: true, stderr: compactText(stderr), stdout: compactText(stdout, Number.POSITIVE_INFINITY) };
  } catch (error) {
    // External npm and Node commands can fail independently of this process.
    const errorRecord = error && typeof error === 'object' ? error : {};

    return {
      ok: false,
      reason: getErrorReason(error),
      stderr: compactText(errorRecord.stderr),
      stdout: compactText(errorRecord.stdout)
    };
  }
}

function parseVersionFromNpmView(output) {
  if (!output.trim()) {
    return createFailure('`npm view` returned an empty version.');
  }

  try {
    const parsed = JSON.parse(output);

    return typeof parsed === 'string' && parsed.trim()
      ? { ok: true, version: parsed.trim() }
      : createFailure('`npm view` did not return a version string.');
  } catch (error) {
    // npm registry output is outside this script's control.
    return createFailure(`could not parse npm metadata: ${compactText(error)}.`);
  }
}

async function checkNpmMetadata(packageName, cwd) {
  const command = await runCommand('npm', ['view', packageName, 'version', '--json'], { cwd });

  return command.ok
    ? parseVersionFromNpmView(command.stdout)
    : createFailure(`npm metadata check failed: ${command.reason}.`);
}

function createDocsReport(url, status, reasons, statusCode) {
  return {
    reasons,
    status,
    ...(statusCode === undefined ? {} : { statusCode }),
    url
  };
}

async function checkDocsUrl(url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(DOCS_TIMEOUT_MS)
    });
    const { status } = response;
    const body = await response.text();

    if (status !== 200) {
      return createDocsReport(url, 'FAIL', [`docs returned HTTP ${status}.`], status);
    }

    if (!body.trim()) {
      return createDocsReport(url, 'FAIL', ['docs returned an empty response.'], status);
    }

    if (!/nvidia/i.test(body) || !/elements/i.test(body)) {
      return createDocsReport(url, 'WARN', ['docs response did not look like NVIDIA Elements documentation.'], status);
    }

    return createDocsReport(url, 'PASS', [], status);
  } catch (error) {
    // The docs site check crosses the network boundary.
    return createDocsReport(url, 'FAIL', [`docs request failed: ${compactText(error)}.`]);
  }
}

async function checkDocsSites() {
  return Promise.all(DOCS_URLS.map(checkDocsUrl));
}

async function readInstalledPackageVersion(packageName, tempDir, installCommand) {
  if (!installCommand.ok) {
    return createFailure(`npm install failed: ${installCommand.reason}.`);
  }

  try {
    const { version } = JSON.parse(
      await readFile(path.join(tempDir, 'node_modules', packageName, 'package.json'), 'utf8')
    );

    return typeof version === 'string' && version.trim()
      ? { ok: true, version: version.trim() }
      : createFailure(`${packageName} package.json did not contain a version string.`);
  } catch (error) {
    // Installed package metadata comes from npm's generated node_modules tree.
    return createFailure(`${packageName} package.json was not readable: ${compactText(error)}.`);
  }
}

function createResolveScript(packageNames) {
  return `const packageNames = ${JSON.stringify(packageNames)};
console.log(JSON.stringify(Object.fromEntries(
  packageNames.map(packageName => {
    try {
      return [packageName, { ok: true, resolved: import.meta.resolve(packageName) }];
    } catch (error) {
      return [packageName, { ok: false, reason: error instanceof Error ? error.message : String(error) }];
    }
  }),
)));
`;
}

async function checkPackageResolution(packageNames, tempDir, installCommand) {
  if (!installCommand.ok) {
    return createFailedPackageMap(packageNames, `npm install failed before resolve check: ${installCommand.reason}.`);
  }

  const resolveScriptPath = path.join(tempDir, 'resolve-check.mjs');
  await writeFile(resolveScriptPath, createResolveScript(packageNames));
  const command = await runCommand('node', [resolveScriptPath], { cwd: tempDir });

  if (!command.ok) {
    return createFailedPackageMap(packageNames, `resolve script failed: ${command.reason}.`);
  }

  try {
    return JSON.parse(command.stdout);
  } catch (error) {
    // The resolve script is a separate Node process with its own output.
    return createFailedPackageMap(packageNames, `resolve script returned invalid JSON: ${compactText(error)}.`);
  }
}

async function checkNpmPackages(packageNames) {
  const notes = [];
  let tempDir;

  try {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'nvidia-elements-availability-report-'));
  } catch (error) {
    // Temporary project creation depends on the host filesystem.
    const reason = `temporary test project could not be created: ${compactText(error)}.`;
    return createFailedNpmPackageChecks(packageNames, notes, reason);
  }

  try {
    const npmChecks = await createPackageMapAsync(packageNames, packageName => checkNpmMetadata(packageName, tempDir));
    const initCommand = await runCommand('npm', ['init', '-y'], { cwd: tempDir });
    const installCommand = initCommand.ok
      ? await runCommand('npm', ['install', '--no-audit', '--no-fund', ...packageNames], { cwd: tempDir })
      : createFailure(`npm init failed: ${initCommand.reason}`);
    const installChecks = await createPackageMapAsync(packageNames, packageName =>
      readInstalledPackageVersion(packageName, tempDir, installCommand)
    );
    const resolveChecks = await checkPackageResolution(packageNames, tempDir, installCommand);

    return { installChecks, notes, npmChecks, resolveChecks };
  } catch (error) {
    // Temporary package checks depend on npm and the host filesystem.
    const reason = `temporary npm project check failed: ${compactText(error)}.`;

    return createFailedNpmPackageChecks(packageNames, notes, reason);
  } finally {
    try {
      await rm(tempDir, { force: true, recursive: true });
    } catch (error) {
      // Temporary project cleanup depends on the host filesystem.
      notes.push(`Temporary test project cleanup failed: ${compactText(error)}.`);
    }
  }
}

function createPackageReport({ installCheck, npmCheck, packageName, resolveCheck }) {
  const npmVersion = npmCheck.ok ? npmCheck.version : undefined;
  const installedVersion = installCheck.ok ? installCheck.version : undefined;
  const baseReport = { installedVersion, npmVersion, packageName };
  const reasons = [
    !npmCheck.ok && npmCheck.reason,
    !installCheck.ok && installCheck.reason,
    !resolveCheck.ok && `package resolution failed: ${resolveCheck.reason}.`
  ].filter(Boolean);
  const hasVersionMismatch = npmVersion !== installedVersion;

  if (reasons.length > 0 || hasVersionMismatch) {
    return {
      ...baseReport,
      reasons:
        reasons.length > 0
          ? reasons
          : [`installed version \`${installedVersion}\` differs from npm latest \`${npmVersion}\`.`],
      status: reasons.length > 0 ? 'FAIL' : 'WARN'
    };
  }

  return {
    ...baseReport,
    reasons: [],
    status: 'PASS'
  };
}

function normalizeTimestamp(timestamp = new Date()) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? { ok: false, reason: `invalid timestamp: ${timestamp}` }
    : { ok: true, value: date.toISOString().replace(/\.\d{3}Z$/, 'Z') };
}

function getCheck(checks, packageName, reason) {
  return checks[packageName] ?? createFailure(reason);
}

function getOverallStatus({ docs, packages }) {
  const statuses = [...docs, ...packages].map(({ status }) => status);

  if (statuses.includes('FAIL')) {
    return 'FAIL';
  }

  return statuses.includes('WARN') ? 'WARN' : 'PASS';
}

async function runAvailabilityReport({ timestamp } = {}) {
  const normalizedTimestamp = normalizeTimestamp(timestamp);

  if (!normalizedTimestamp.ok) {
    return {
      docs: [createDocsReport('timestamp', 'FAIL', [normalizedTimestamp.reason])],
      notes: [],
      overallStatus: 'FAIL',
      packages: [],
      timestamp: String(timestamp)
    };
  }

  const [docs, { installChecks, notes, npmChecks, resolveChecks }] = await Promise.all([
    checkDocsSites(),
    checkNpmPackages(PACKAGES)
  ]);
  const packages = PACKAGES.map(packageName =>
    createPackageReport({
      installCheck: getCheck(installChecks, packageName, 'install check returned no result.'),
      npmCheck: getCheck(npmChecks, packageName, 'npm metadata check returned no result.'),
      packageName,
      resolveCheck: getCheck(resolveChecks, packageName, 'resolve check returned no result.')
    })
  );
  return {
    docs,
    notes,
    overallStatus: getOverallStatus({ docs, packages }),
    packages,
    timestamp: normalizedTimestamp.value
  };
}

function formatDocsLines(docs) {
  return [
    '**Docs:**',
    ...(Array.isArray(docs) ? docs : [docs]).flatMap(docsReport => {
      const status = docsReport.status ?? (docsReport.ok ? 'PASS' : 'FAIL');
      const reasons = docsReport.reasons ?? [docsReport.reason].filter(Boolean);

      return [
        `- ${STATUS_LABELS[status]} \`${docsReport.url}\``,
        ...(reasons.length > 0 ? [`     Reason: ${reasons.join(' ')}`] : [])
      ];
    })
  ];
}

function formatPackageName(packageReport) {
  const version = packageReport.npmVersion ?? packageReport.installedVersion;
  return version ? `${packageReport.packageName}@${version}` : packageReport.packageName;
}

function formatPackageLines(packageReport) {
  return [
    `- ${STATUS_LABELS[packageReport.status]} \`${formatPackageName(packageReport)}\``,
    ...(packageReport.reasons.length > 0 ? [`  Reason: ${packageReport.reasons.join(' ')}`] : [])
  ];
}

function formatAvailabilityReport(report) {
  const notes = report.notes.length > 0 ? `**Notes:**${report.notes.map(note => `• ${note}`).join('\n')}` : '';

  return [
    `**NVIDIA Elements Production Availability Report** (\`${report.timestamp}\`)`,
    '',
    ...formatDocsLines(report.docs),
    '',
    '**Packages:**',
    ...report.packages.flatMap(formatPackageLines),
    notes
  ].join('\n');
}

export async function generateReport({ timestamp } = {}) {
  const report = await runAvailabilityReport({ timestamp });
  return { formattedReport: formatAvailabilityReport(report), report };
}

function parseArgs(args) {
  const parsed = { errors: [], help: false, json: false, timestamp: undefined };
  const timestampValueError = 'missing or invalid value for --timestamp';

  args.forEach((arg, index) => {
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--json') {
      parsed.json = true;
    } else if (arg.startsWith('--timestamp=')) {
      const timestamp = arg.slice('--timestamp='.length);

      if (timestamp && !timestamp.startsWith('-')) {
        parsed.timestamp = timestamp;
      } else {
        parsed.errors.push(timestampValueError);
      }
    } else if (arg === '--timestamp') {
      const timestamp = args.at(index + 1);

      if (timestamp && !timestamp.startsWith('-')) {
        parsed.timestamp = timestamp;
      } else {
        parsed.errors.push(timestampValueError);
      }
    } else if (args.at(index - 1) !== '--timestamp' || arg.startsWith('-')) {
      parsed.errors.push(`unsupported argument: ${arg}`);
    }
  });

  return parsed;
}

function printHelp() {
  process.stdout.write(`Usage: node .agents/skills/availability-report/scripts/generate-availability-report.js [options]

Options:
  --json                  Print the structured check result instead of the formatted report.
  --timestamp <iso-utc>   Override the report timestamp for deterministic verification.
  -h, --help              Show this help text.
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.errors.length > 0) {
    process.stderr.write(`${options.errors.join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printHelp();
    return;
  }

  const npmAvailability = await runCommand('npm', ['--version'], { timeoutMs: 30_000 });

  if (!npmAvailability.ok) {
    process.stderr.write(`Environment failure: npm is not available: ${npmAvailability.reason}.\n`);
    process.exitCode = 1;
    return;
  }

  const { formattedReport, report } = await generateReport({ timestamp: options.timestamp });

  process.stdout.write(options.json ? `${JSON.stringify(report, null, 2)}\n` : `${formattedReport}\n`);

  if (report.overallStatus === 'FAIL') {
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write(`Unexpected availability-report failure: ${compactText(error)}.\n`);
    process.exitCode = 1;
  });
}
