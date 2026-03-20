import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ProjectsService } from '@internals/metadata';
import { type ElementVersions, getLatestPublishedVersions } from '../api/utils.js';
import { getNPMClient, getPackageJson } from '../internal/node.js';
import type { Report, PackageData } from '../internal/types.js';

export interface PackageUpdate {
  name: string;
  from: string;
  to: string;
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
  const packageJson = getPackageJson(cwd);
  const projects = (await ProjectsService.getData()).data.filter((p: { changelog: string }) => p.changelog);
  const packageManager = await getNPMClient();
  const { packageJson: updatedPackageJson, updated } = updatePackageJson(
    packageJson,
    await getLatestPublishedVersions(projects)
  );

  if (updated.length === 0) {
    return {
      dependencies: {
        message: `All packages are already up to date.\n\`${resolve(join(cwd, 'package.json'))}\``,
        status: 'success'
      }
    };
  }

  try {
    writeFileSync(resolve(join(cwd, 'package.json')), JSON.stringify(updatedPackageJson, null, 2));
    execSync(`cd ${cwd} && ${packageManager} update '@nvidia-elements/*' '@nvidia-elements/*'}`);
  } catch (e) {
    return {
      dependencies: {
        message: `Failed to update to the latest version. \n${e}`,
        status: 'danger'
      }
    };
  }

  const changes = updated.map(u => `${u.name}: ${u.from} → ${u.to}`).join('\n');
  return {
    dependencies: {
      message: `Updated ${updated.length} package(s):\n${changes}`,
      status: 'success'
    }
  };
}
