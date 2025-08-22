import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { MetadataService } from '@internals/metadata';
import { type ElementVersions, getLatestPublishedVersions } from '../api/utils.js';
import { getNPMClient, getPackageJson } from '../internal/node.js';
import type { Report, PackageData } from '../internal/types.js';

export function updatePackageJson(packageJson: PackageData, currentVersions: ElementVersions) {
  const packageNames = Object.keys(currentVersions);

  packageNames.forEach(packageName => {
    if (
      packageJson.peerDependencies?.[packageName] &&
      !packageJson.peerDependencies[packageName]?.includes('catalog')
    ) {
      packageJson.peerDependencies[packageName] = `^${currentVersions[packageName]}`;
    }

    if (packageJson.dependencies?.[packageName] && !packageJson.dependencies[packageName]?.includes('catalog')) {
      packageJson.dependencies[packageName] = currentVersions[packageName];
    }

    if (packageJson.devDependencies?.[packageName] && !packageJson.devDependencies[packageName]?.includes('catalog')) {
      packageJson.devDependencies[packageName] = currentVersions[packageName];
    }
  });

  return packageJson;
}

/* istanbul ignore next -- @preserve */
export async function updateProject(cwd: string): Promise<Report> {
  const packageJson = getPackageJson(cwd);
  const metadata = await MetadataService.getMetadata();
  const packageManager = await getNPMClient();
  const updatedPackageJson = updatePackageJson(packageJson, await getLatestPublishedVersions(metadata));

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

  return {
    dependencies: {
      message: 'Successfully updated.',
      status: 'success'
    }
  };
}
