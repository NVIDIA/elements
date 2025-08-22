import { publint as publintFn } from 'publint';
import { MetadataService } from '@internals/metadata';
import { type ElementVersions, getLatestPublishedVersions } from '../api/utils.js';
import type { ReportCheck, Report, PackageData } from '../internal/types.js';
import { getPackageJson } from '../internal/node.js';

export async function getHealthReport(cwd: string, type: 'application' | 'library') {
  const packageJson = getPackageJson(cwd);
  const metadata = await MetadataService.getMetadata();
  const currentVersions = await getLatestPublishedVersions(metadata);

  let report: Report = {
    dependencies: await checkDependencies(packageJson, currentVersions)
  };

  if (type === 'library') {
    report.peerDependencies = checkPeerDependencies(currentVersions, packageJson);
    report.semanticDependencies = checkSemanticDependencies(packageJson);
    report = { ...report, ...(await checkPublint(cwd)) };
  }

  return report;
}

export async function getVersionHealth(packageData: PackageData, currentVersions: ElementVersions) {
  const projectDependencies = Object.entries({
    ...packageData.devDependencies,
    ...packageData.dependencies,
    ...packageData.peerDependencies
  })
    .filter(([key]) => key.includes('@nvidia-elements/') || key.includes('@nvidia-elements/'))
    .reduce(
      (acc, [key, value]) => {
        return { ...acc, [key]: value as string };
      },
      {} as Record<string, string>
    );

  const report: { [key: string]: { version: string; latest: string; status: 'success' | 'warning' | 'danger' } } = {};

  Object.entries(projectDependencies).forEach(([packageName, packageVersion]) => {
    report[packageName] = {
      version: packageVersion,
      latest: currentVersions[packageName],
      status: getVersionStatus(packageVersion, currentVersions[packageName])
    };
  });
  return report;
}

export function getVersionStatus(projectVersion: string, packageVersion: string): 'success' | 'warning' | 'danger' {
  const projectVersionNum = getVersionNum(projectVersion);
  const packageVersionNum = getVersionNum(packageVersion);

  if (projectVersionNum.major < packageVersionNum.major) {
    return 'danger';
  }

  if (projectVersionNum.minor < packageVersionNum.minor - 5) {
    return 'warning';
  }

  return 'success';
}

export function getVersionNum(value: string): { major: number; minor: number; patch: number } {
  const version = value
    .replace('^', '')
    .replace('~', '')
    .split('.')
    .map(s => parseFloat(s));
  return {
    major: version[0],
    minor: version[1],
    patch: version[2]
  };
}

async function checkPublint(cwd: string): Promise<Report> {
  const { messages } = await publintFn({
    pkgDir: cwd,
    pack: 'pnpm'
  });
  const results: Report & { libraryPublint?: ReportCheck; libraryPeerDependencies?: ReportCheck } = {};

  const statusOptions = {
    suggestion: 'warning',
    warning: 'warning',
    error: 'danger'
  };

  messages.forEach(check => {
    results[`library ${check.code.replace(/_/g, ' ').toLowerCase()}`] = {
      message: `https://publint.dev/rules#${check.code}`,
      status: statusOptions[check.type] as 'danger' | 'info' | 'warning'
    };
  });

  if (!messages.length) {
    results.libraryPublint = {
      message: 'passed checks',
      status: 'success'
    };
  }

  return results;
}

export function checkPeerDependencies(currentVersions: ElementVersions, packageJson: PackageData): ReportCheck {
  const elementPackages = Object.keys(currentVersions);
  const dependencies = Object.keys(packageJson.dependencies ?? {});
  const devDependencies = Object.keys(packageJson.devDependencies ?? {});
  const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});

  const hasDevDependencies = devDependencies.some(dependency => elementPackages.includes(dependency));
  const hasDependencies = dependencies.some(dependency => elementPackages.includes(dependency));
  const hasPeerDependencies = peerDependencies.some(dependency => elementPackages.includes(dependency));

  if (hasDependencies) {
    return {
      message: '@nve packages must be listed as peer dependencies',
      status: 'danger'
    };
  } else if (!hasPeerDependencies && !hasDevDependencies && !hasDependencies) {
    return {
      message: 'No @nve packages found in the project',
      status: 'warning'
    };
  } else {
    return {
      message: '@nve packages are listed as peer dependencies',
      status: 'success'
    };
  }
}

export function checkSemanticDependencies(packageJson: PackageData): ReportCheck {
  const hasPinnedVersion = Object.entries(packageJson.peerDependencies ?? {}).find(
    ([key, value]) => key.includes('@nve') && !value.startsWith('^')
  );

  if (hasPinnedVersion) {
    return {
      message: '@nve packages must contain caret (^) prefix',
      status: 'danger'
    };
  } else {
    return {
      message: '@nve packages contain caret (^) prefix',
      status: 'success'
    };
  }
}

export async function checkDependencies(packageJson: PackageData, currentVersions: ElementVersions) {
  const versions = await getVersionHealth(packageJson, currentVersions);
  const dependencies = Object.keys(packageJson.dependencies ?? {});
  const devDependencies = Object.keys(packageJson.devDependencies ?? {});
  const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});
  const elementPackages = Object.keys(currentVersions);
  const allDependencies = [...dependencies, ...devDependencies, ...peerDependencies];
  let status: 'success' | 'danger' | 'warning' = 'success';
  let message = '@nve packages are up to date';

  if (!allDependencies.some(dependency => elementPackages.includes(dependency))) {
    status = 'warning';
    message = 'No @nve packages found in the project';
  }

  if (
    Object.values(versions).some(version => version.status === 'danger') ||
    Object.values(versions).some(version => version.status === 'warning')
  ) {
    status = 'warning'; // warning for either to ensure this does not trigger a CI runtime failure as this checks the latest version remotely
    message = '@nve packages are out of date';
  }

  return { versions, status, message };
}
