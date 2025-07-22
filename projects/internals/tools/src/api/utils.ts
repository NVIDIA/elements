import type { MetadataSummary } from '@internals/metadata';
import { fuzzyMatch } from '../internal/utils.js';

export function getAvailableElementsAPIs(
  metadata: MetadataSummary
): { name: string; description: string; usage?: string }[] {
  return Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => e.manifest?.deprecated !== 'true' && e.manifest.description)
    .map(e => ({ name: e.name, description: e.manifest.description }));
}

export function searchElementsAPIs(query: string, metadata: MetadataSummary) {
  const matches = new Set(searchTagNames(query, metadata));
  return Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => matches.has(e.name));
}

export function searchElementsAPIsJSON(query: string, metadata: MetadataSummary) {
  return searchElementsAPIs(query, metadata).map(e => ({ tagName: e.name, ...e.manifest }));
}

export function getElementAPIsMarkdown(query: string, metadata: MetadataSummary) {
  return searchElementsAPIs(query, metadata)
    .map(e => e.markdown)
    .join('\n---\n');
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

export function searchChangelogsMarkdown(query: string, metadata: MetadataSummary) {
  const changelogs = searchChangelogs(query, metadata);
  return Object.entries(changelogs)
    .map(([key, value]) => `\n# ${key}\n\n${value}`)
    .join('\n\n---\n\n');
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
              return '0.0.0';
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
