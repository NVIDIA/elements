import type { MetadataCustomElementsManifestDeclaration, MetadataSummary } from '@internals/metadata';
import { fuzzyMatch } from '../internal/utils.js';

export interface PartialAPIResult {
  name: string;
  description: string;
  behavior: string;
}

export function getAvailableAPIs(format: 'markdown' | 'json', metadata: MetadataSummary): PartialAPIResult[] | string {
  const result = Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => !e.manifest?.deprecated && e.manifest.description)
    .map(e => ({ name: e.name, description: e.manifest.description, behavior: e.manifest.metadata?.behavior ?? '' }));

  if (format === 'markdown') {
    return result
      .map(e => {
        const behavior = e.behavior ? ` (${e.behavior})` : '';
        return `## ${e.name}${behavior}\n\n${e.description}`;
      })
      .join('\n\n---\n\n');
  } else if (format === 'json') {
    return result;
  }
}

export function searchAPIs(
  query: string,
  format: 'markdown' | 'json',
  metadata: MetadataSummary
): MetadataCustomElementsManifestDeclaration[] | string {
  const matches = new Set(searchTagNames(query, metadata));
  const result = Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => !e.manifest.deprecated && (matches.has(e.name) || matches.has(e.manifest.tagName)));
  const markdown = result.map(e => e.markdown).join('\n---\n');
  return format === 'markdown' ? markdown : result.map(e => e.manifest);
}

export function searchTagNames(query: string, metadata: MetadataSummary): string[] {
  const elements = Object.values(metadata.projects)
    .filter(i => i.elements)
    .flatMap(i => i.elements);
  return fuzzyMatch(
    query,
    elements.map(e => e.name)
  );
}

export function getChangelogs(metadata: MetadataSummary) {
  return Object.keys(metadata.projects).reduce((results, project) => {
    return { ...results, [project]: metadata.projects[project].changelog };
  }, {});
}

export function searchChangelogs(query: string, metadata: MetadataSummary) {
  const changelogs = getChangelogs(metadata);
  const matches = fuzzyMatch(query, Object.keys(changelogs));
  return Object.fromEntries(
    Object.entries(changelogs).filter(([key]) => (matches.length ? matches.includes(key) : true))
  ) as Record<string, string>;
}

export interface ElementVersions {
  '@nvidia-elements/core': string;
  '@nvidia-elements/core-react': string;
  '@nvidia-elements/styles': string;
  '@nvidia-elements/testing': string;
  '@nvidia-elements/themes': string;
  '@nvidia-elements/behaviors-alpine': string;
  '@nvidia-elements/brand': string;
  '@nvidia-elements/code': string;
  '@nvidia-elements/forms': string;
  '@nvidia-elements/monaco': string;
}

/* istanbul ignore next -- @preserve */
let versions: ElementVersions | null = null;
/* istanbul ignore next -- @preserve */
export async function getLatestPublishedVersions(metadata: MetadataSummary): Promise<ElementVersions> {
  if (!versions) {
    const names = getPublishedPackageNames(metadata);
    const packageFile = await Promise.all(
      names
        .map(name => `https://https://esm.sh/${name}@latest/package.json`)
        .map(url => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          return fetch(url, { signal: controller.signal })
            .then(res => {
              clearTimeout(timeout);
              return res.json();
            })
            .catch(() => {
              console.warn('Could not fetch latest version from https://https://esm.sh');
              return {};
            });
        })
    );
    versions = packageFile.reduce((acc: Record<string, string>, pkg) => ({ ...acc, [pkg.name]: pkg.version }), {});
  }
  return versions;
}

export function getPublishedPackageNames(metadata: MetadataSummary) {
  return Object.keys(metadata.projects).filter(
    i => i.startsWith('@nve') && !i.startsWith('@nve-internals') && metadata.projects[i].version !== '0.0.0'
  );
}
