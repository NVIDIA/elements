import type { ElementVersions } from './api.js';

export interface PackageData {
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
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

function getVersionStatus(projectVersion: string, packageVersion: string): 'success' | 'warning' | 'danger' {
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

function getVersionNum(value: string): { major: number; minor: number; patch: number } {
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
