import { execSync } from 'node:child_process';
import type { Release } from '../types.ts';

export function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10)
  };
}

export function determineReleaseType(
  currentVersion: string,
  previousVersion?: string
): 'fix' | 'feat' | 'breaking' | 'chore' {
  const current = parseVersion(currentVersion);
  if (!current || !previousVersion) {
    return 'feat';
  }

  const previous = parseVersion(previousVersion);
  if (!previous) {
    return 'feat';
  }

  if (current.major > previous.major && previous.major !== 0) {
    return 'breaking';
  }

  if (current.minor > previous.minor) {
    return 'feat';
  }

  if (current.patch > previous.patch) {
    return 'fix';
  }

  return 'chore';
}

/**
 * Use local git of this repo, get all the commits and filter down the semantic release commits.
 */
export function getReleases(): Release[] {
  try {
    // Get all tags with their creation dates using git for-each-ref
    // This is more reliable than git tag -l with --format
    // Format: <tag-name>|<date> (sorted by creation date, newest first)
    const gitOutput = execSync(
      'git for-each-ref --sort=-creatordate --format="%(refname:short)|%(creatordate:iso-strict)" refs/tags',
      {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }
    ).trim();

    if (!gitOutput) {
      return [];
    }

    const rawReleases: Array<{ name: string; version: string; date: string; packageName: string }> = [];
    const lines = gitOutput.split('\n');

    for (const line of lines) {
      const [tagName, date] = line.split('|');

      if (!tagName || !date) {
        continue;
      }

      const versionMatch = tagName.match(/^(.+)-v(\d+\.\d+\.\d+.*)$/);
      if (versionMatch) {
        const packageName = versionMatch[1]!;
        const version = versionMatch[2]!;

        rawReleases.push({
          name: tagName,
          version,
          date,
          packageName
        });
      }
    }

    const releasesByPackage = rawReleases.reduce<Record<string, typeof rawReleases>>((acc, release) => {
      if (!acc[release.packageName]) {
        acc[release.packageName] = [];
      }
      acc[release.packageName]!.push(release);
      return acc;
    }, {});

    for (const packageName in releasesByPackage) {
      releasesByPackage[packageName]!.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    const releases: Release[] = [];
    for (const packageName in releasesByPackage) {
      const packageReleases = releasesByPackage[packageName]!;

      for (let i = 0; i < packageReleases.length; i++) {
        const release = packageReleases[i]!;
        const previousRelease = i > 0 ? packageReleases[i - 1] : undefined;
        const type = determineReleaseType(release.version, previousRelease?.version);

        releases.push({
          name: release.name,
          version: release.version,
          date: release.date,
          type
        });
      }
    }

    releases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return releases;
  } catch (error) {
    console.error('Error getting releases from git:', error);
    return [];
  }
}
