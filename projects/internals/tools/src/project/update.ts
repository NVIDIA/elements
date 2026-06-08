// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ProjectsService } from '@internals/metadata';
import { type ElementVersions, getLatestPublishedVersions } from '../api/utils.js';
import { getNPMClient, getPackageJson } from '../internal/node.js';
import type { Report, PackageData } from '../internal/types.js';

interface PackageUpdate {
  name: string;
  from: string;
  to: string;
}

interface ProjectDependencyUpdateOptions {
  cwd: string;
  packageJson: PackageData;
  packageJsonPath: string;
  packageManager: string;
}

export function updatePackageJson(
  packageJson: PackageData,
  currentVersions: ElementVersions
): { packageJson: PackageData; updated: PackageUpdate[] } {
  const versions = currentVersions as unknown as Record<string, string>;
  const packageNames = Object.keys(versions);
  const updated: PackageUpdate[] = [];

  function updateDeps(deps: Record<string, string> | undefined, packageName: string, targetVersion: string) {
    if (!deps?.[packageName] || deps[packageName]?.includes('catalog')) {
      return;
    }
    const from = deps[packageName]!;
    if (from !== targetVersion) {
      updated.push({ name: packageName, from, to: targetVersion });
      deps[packageName] = targetVersion;
    }
  }

  packageNames.forEach(packageName => {
    updateDeps(packageJson.peerDependencies, packageName, `^${versions[packageName]!}`);
    updateDeps(packageJson.dependencies, packageName, versions[packageName]!);
    updateDeps(packageJson.devDependencies, packageName, versions[packageName]!);
  });

  return { packageJson, updated };
}

/* istanbul ignore next -- @preserve */
export async function updateProject(cwd: string): Promise<Report> {
  const packageJsonPath = resolve(join(cwd, 'package.json'));
  if (!existsSync(packageJsonPath)) {
    return createMissingPackageJsonReport(packageJsonPath);
  }

  const packageJson = getPackageJson(cwd);
  const projects = (await ProjectsService.getData()).data.filter((p: { changelog: string }) => p.changelog);
  const { packageJson: updatedPackageJson, updated } = updatePackageJson(
    packageJson,
    await getLatestPublishedVersions(projects)
  );

  if (updated.length === 0) {
    return createCurrentPackageReport(packageJsonPath);
  }

  const packageManager = await getNPMClient();
  if (!packageManager) {
    return createMissingPackageManagerReport();
  }

  const updateError = updateProjectDependencies({
    cwd,
    packageJson: updatedPackageJson,
    packageJsonPath,
    packageManager
  });
  if (updateError) return updateError;

  return createUpdatedPackageReport(updated);
}

function updateProjectDependencies(options: ProjectDependencyUpdateOptions): Report | null {
  const { cwd, packageJson, packageJsonPath, packageManager } = options;

  try {
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    execFileSync(packageManager, ['update', '@nvidia-elements/*'], { cwd });
  } catch (e) {
    const output = getExecFileSyncOutput(e);
    if (packageManager === 'pnpm' && output.includes('ERR_PNPM_IGNORED_BUILDS')) {
      return null;
    }

    return {
      dependencies: {
        message: `Failed to update to the latest version. \n${output}`,
        status: 'danger'
      }
    };
  }

  return null;
}

function getExecFileSyncOutput(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return `${error}`;
  }

  const execError = error as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
  const stdout = execError.stdout?.toString() ?? '';
  const stderr = execError.stderr?.toString() ?? '';
  const output = `${stdout}\n${stderr}`.trim();

  return output || execError.message || 'Command failed';
}

function createMissingPackageJsonReport(packageJsonPath: string): Report {
  return {
    dependencies: {
      message: `No package.json found in the project directory. Dependencies were not updated.\n\`${packageJsonPath}\``,
      status: 'warning'
    }
  };
}

function createCurrentPackageReport(packageJsonPath: string): Report {
  return {
    dependencies: {
      message: `All packages are already up to date.\n\`${packageJsonPath}\``,
      status: 'success'
    }
  };
}

function createMissingPackageManagerReport(): Report {
  return {
    dependencies: {
      message: 'No supported package manager found. Dependencies were not updated.',
      status: 'danger'
    }
  };
}

function createUpdatedPackageReport(updated: PackageUpdate[]): Report {
  const changes = updated.map(u => `${u.name}: ${u.from} → ${u.to}`).join('\n');
  return {
    dependencies: {
      message: `Updated ${updated.length} package(s):\n${changes}`,
      status: 'success'
    }
  };
}
