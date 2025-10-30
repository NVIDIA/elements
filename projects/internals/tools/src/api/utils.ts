import type { Element, Attribute, MetadataSummary } from '@internals/metadata';
import { fuzzyMatch } from '../internal/search.js';
import { removeNoiseWords } from '../internal/search.js';

export interface PartialAPIResult {
  name: string;
  description: string;
  behavior: string;
}

export function getAvailableAPIs(
  format: 'markdown' | 'json',
  metadata: MetadataSummary
): { elements: PartialAPIResult[]; attributes: PartialAPIResult[] } | string {
  const elementsResult = Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => !e.manifest?.deprecated && e.manifest.description)
    .map(e => ({ name: e.name, description: e.manifest.description, behavior: e.manifest.metadata?.behavior ?? '' }));
  const elementsMarkdown = elementsResult.map(e => {
    const behavior = e.behavior ? ` (${e.behavior})` : '';
    return `## ${e.name}${behavior}\n\n${e.description}`;
  });

  const attributesResult = Object.values(metadata.projects)
    .flatMap(i => (i.attributes?.length ? i.attributes : []))
    .filter(a => a.description)
    .map(a => ({ name: a.name, description: a.description, behavior: 'attribute' }));
  const attributesMarkdown = attributesResult.map(a => `## ${a.name} (${a.behavior})\n\n${a.description}`);

  if (format === 'markdown') {
    return [...elementsMarkdown, ...attributesMarkdown].join('\n\n---\n\n');
  } else if (format === 'json') {
    return { elements: elementsResult, attributes: attributesResult };
  }
}

export function searchAPIs(
  query: string,
  format: 'markdown' | 'json',
  metadata: MetadataSummary
): { elements: Element[]; attributes: Attribute[] } | string {
  const q = removeNoiseWords(query.trim().toLowerCase());

  const elementMatches = new Set(searchTagNames(q, metadata));
  const elements = Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => !e.manifest.deprecated && (elementMatches.has(e.name) || elementMatches.has(e.manifest.tagName)));

  const attributeMatches = new Set(searchAttributes(q, metadata));
  const attributes = Object.values(metadata.projects)
    .flatMap(i => (i.attributes?.length ? i.attributes : []))
    .filter(a => attributeMatches.has(a.name));

  const markdown = [...elements, ...attributes].map(e => e.markdown).join('\n\n---\n\n');
  return format === 'markdown' ? markdown : { elements: elements.map(e => e.manifest), attributes };
}

export function searchTagNames(query: string, metadata: MetadataSummary): string[] {
  const elements = Object.values(metadata.projects).flatMap(i => (i.elements?.length ? i.elements : []));

  const elementNames = elements.map(e => e.name);

  // First, check if any element names are explicitly mentioned in the query
  const queryLower = query.toLowerCase();
  const explicitMatches = elementNames.filter(name => queryLower.includes(name));

  // If we have explicit matches, use those; otherwise use fuzzy matching
  const matches = explicitMatches.length > 0 ? explicitMatches : fuzzyMatch(query, elementNames);

  if (matches.length === 0) {
    return [];
  }

  // Group matches by their base component (e.g., nve-card, nve-accordion)
  const families = new Map<string, Set<string>>();

  for (const match of matches) {
    // Find the base component name (the part before the first child indicator)
    // For nve-card-header, the base is nve-card
    // For nve-card, the base is nve-card
    let base = match;
    const parts = match.split('-');

    // Try to find if this is a child element by checking if a parent exists
    for (let i = parts.length - 1; i >= 2; i--) {
      const potentialParent = parts.slice(0, i).join('-');
      if (elementNames.includes(potentialParent)) {
        base = potentialParent;
        break;
      }
    }

    if (!families.has(base)) {
      families.set(base, new Set());
    }

    // Add the base and all its children
    families.get(base)!.add(base);
    for (const elementName of elementNames) {
      if (elementName.startsWith(base + '-')) {
        families.get(base)!.add(elementName);
      }
    }
  }

  // Flatten the families into a result array, maintaining original order from metadata
  const result: string[] = [];
  const seen = new Set<string>();

  for (const family of families.values()) {
    // Maintain the original order from elementNames instead of sorting
    for (const elementName of elementNames) {
      if (family.has(elementName) && !seen.has(elementName)) {
        result.push(elementName);
        seen.add(elementName);
      }
    }
  }

  return result;
}

export function searchAttributes(query: string, metadata: MetadataSummary): string[] {
  const attributes = Object.values(metadata.projects).flatMap(i => (i.attributes?.length ? i.attributes : []));
  return fuzzyMatch(
    query,
    attributes.map(a => a.name)
  );
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
  '@nvidia-elements/cli': string;
  '@nvidia-elements/lint': string;
  '@nvidia-elements/forms': string;
  '@nvidia-elements/markdown': string;
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
