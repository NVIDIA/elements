import type { MetadataSummary } from '@nve-internals/metadata';
import { fuzzyMatch } from '../internal/utils.js';

export function getChangelogs(metadata: MetadataSummary): { [key: string]: string } {
  return Object.keys(metadata.projects)
    .filter(p => metadata.projects[p].changelog)
    .reduce((results, project) => {
      return { ...results, [project]: metadata.projects[project].changelog };
    }, {});
}

export function searchChangelogs(query: string, metadata: MetadataSummary) {
  const changelogs = getChangelogs(metadata);
  const matches = fuzzyMatch(query, Object.keys(changelogs));
  return changelogs[matches[0]];
}
