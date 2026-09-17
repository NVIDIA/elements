// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { applyReleaseAgeOverride, createIsolatedEnvironment, DEFAULT_TIMEOUT_MS, runCommand } from './environment.js';

/**
 * This is deliberately verification configuration, not starter discovery.
 * Discovery comes from the installed production CLI. A mismatch is a failure,
 * so a new production starter cannot silently escape verification.
 */
export const STARTERS = [
  'angular',
  'bundles',
  'eleventy',
  'go',
  'go-htmx',
  'hugo',
  'lit-library',
  'mcp-app',
  'nextjs',
  'nuxt',
  'react',
  'solidjs',
  'svelte',
  'typescript',
  'vue'
];

function now() {
  return new Date().toISOString();
}

export function compareInventory(discovered, configured = STARTERS) {
  const discoveredSet = new Set(discovered);
  const configuredSet = new Set(configured);
  const missingConfiguration = discovered.filter(starter => !configuredSet.has(starter));
  const unsupportedByProduction = configured.filter(starter => !discoveredSet.has(starter));
  return {
    missingConfiguration,
    unsupportedByProduction,
    ok: discovered.length === discoveredSet.size && !missingConfiguration.length && !unsupportedByProduction.length
  };
}

async function readPackageJson(projectDir) {
  try {
    return JSON.parse(await readFile(path.join(projectDir, 'package.json'), 'utf8'));
  } catch {
    return undefined;
  }
}

function hasDependencies(packageJson) {
  return Boolean(
    Object.keys(packageJson?.dependencies ?? {}).length || Object.keys(packageJson?.devDependencies ?? {}).length
  );
}

export function evaluateCreation({ command, hasNodeModules, output, packageJson, projectExists }) {
  const reasons = [];
  if (!command.ok) {
    reasons.push(command.timedOut ? 'CLI creation timed out.' : `CLI creation exited ${command.exitCode}.`);
  }
  if (
    /failed to create|error installing dependencies|dependency build scripts were skipped|status[^\n]*danger/i.test(
      output ?? `${command.stdout}\n${command.stderr}`
    )
  ) {
    reasons.push('CLI output reported a creation or installation failure.');
  }
  if (!projectExists) reasons.push('Expected project directory was not created.');
  if (!packageJson) reasons.push('Generated package.json was missing or unreadable.');
  if (hasDependencies(packageJson) && !hasNodeModules) {
    reasons.push('Dependency installation did not produce node_modules.');
  }
  return { ok: reasons.length === 0, reasons };
}

export function verificationScript(packageJson) {
  if (packageJson?.scripts?.ci) return 'ci';
  if (packageJson?.scripts?.build) return 'build';
  throw new Error('Generated package.json exposed neither a ci nor build script.');
}

export async function runStarterPlans(plans, verify) {
  const results = [];
  for (const plan of plans) {
    try {
      results.push(await verify(plan));
    } catch (error) {
      results.push({ name: plan.name, status: 'fail', error: error.message });
    }
  }
  return results;
}

export async function finalizeProject(projectDir, status) {
  if (status === 'pass') await rm(projectDir, { recursive: true, force: true });
}

export async function verifyStarter({ cli, name, progress, runRoot, toolBin }) {
  const startedAt = Date.now();
  const projectParent = path.join(runRoot, 'projects', name);
  const projectDir = path.join(projectParent, name);
  const evidenceDir = path.join(runRoot, 'evidence', name);
  await Promise.all([mkdir(projectParent, { recursive: true }), mkdir(evidenceDir, { recursive: true })]);
  const isolated = await createIsolatedEnvironment(runRoot, `starter-${name}`);
  const env = applyReleaseAgeOverride({
    ...isolated.env,
    PATH: `${path.dirname(cli.binary)}:${toolBin}:/usr/bin:/bin:/usr/sbin:/sbin`
  });
  const commands = [];
  let phase = 'create';
  const result = {
    commands,
    evidenceDir,
    failingPhase: null,
    name,
    projectDir,
    startedAt: now(),
    status: 'fail'
  };
  try {
    progress(`${name}: creating project and installing dependencies`);
    const createLog = path.join(evidenceDir, 'create.log');
    const create = await runCommand(cli.binary, ['project.create', name, '--cwd', projectParent, '--start=false'], {
      env,
      logFile: createLog,
      progress,
      progressLabel: `${name} creation`,
      timeoutMs: DEFAULT_TIMEOUT_MS
    });
    commands.push({ ...create, phase });
    const packageJson = await readPackageJson(projectDir);
    const creation = evaluateCreation({
      command: create,
      hasNodeModules: existsSync(path.join(projectDir, 'node_modules')),
      output: await readFile(createLog, 'utf8'),
      packageJson,
      projectExists: existsSync(projectDir)
    });
    if (!creation.ok) throw new Error(creation.reasons.join(' '));

    phase = 'verification';
    const script = verificationScript(packageJson);
    phase = script;
    progress(`${name}: running pnpm run ${script}`);
    const verification = await runCommand('pnpm', ['run', script], {
      cwd: projectDir,
      env,
      logFile: path.join(evidenceDir, `${script}.log`),
      progress,
      progressLabel: `${name} ${script}`,
      timeoutMs: DEFAULT_TIMEOUT_MS
    });
    commands.push({ ...verification, phase });
    if (!verification.ok) {
      throw new Error(verification.timedOut ? `${phase} timed out.` : `${phase} exited ${verification.exitCode}.`);
    }

    result.status = 'pass';
    result.durationMs = Date.now() - startedAt;
    progress(`${name}: PASS (${Math.round(result.durationMs / 1000)}s)`);
  } catch (error) {
    result.durationMs = Date.now() - startedAt;
    result.error = error.message;
    result.failingPhase = phase;
    progress(`${name}: FAIL during ${phase} (${error.message})`);
  }
  await finalizeProject(projectDir, result.status);
  await writeFile(path.join(evidenceDir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}
