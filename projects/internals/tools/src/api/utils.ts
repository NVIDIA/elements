import { type Attribute, type Project, type Element, type Token, type ProjectTypes } from '@internals/metadata';

export interface PartialAPIResult {
  name: string;
  description: string;
  behavior: string;
}

export function getAvailableAPIs(
  format: 'markdown' | 'json',
  metadata: {
    created: string;
    data: {
      elements: Element[];
      attributes: Attribute[];
      tokens: Token[];
      types: ProjectTypes[];
    };
  }
): { elements: PartialAPIResult[]; attributes: PartialAPIResult[] } | string {
  const elementsResult = metadata.data.elements
    .filter(e => !e.manifest?.deprecated && e.manifest.description)
    .map(e => ({ name: e.name, description: e.manifest.description, behavior: e.manifest.metadata?.behavior ?? '' }));
  const elementsMarkdown = elementsResult.map(e => {
    const behavior = e.behavior ? ` (${e.behavior})` : '';
    return `## ${e.name}${behavior}\n\n${e.description}`;
  });

  const attributesResult = metadata.data.attributes
    .filter(a => a.description)
    .map(a => ({ name: a.name, description: a.description, behavior: 'attribute' }));
  const attributesMarkdown = attributesResult.map(a => `## ${a.name} (${a.behavior})\n\n${a.description}`);

  if (format === 'markdown') {
    return [...elementsMarkdown, ...attributesMarkdown].join('\n\n---\n\n');
  } else if (format === 'json') {
    return { elements: elementsResult, attributes: attributesResult };
  }
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
export async function getLatestPublishedVersions(projects: Project[]): Promise<ElementVersions> {
  if (!versions) {
    const names = getPublishedPackageNames(projects);
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

export function getPublishedPackageNames(projects: Project[]) {
  return projects
    .filter(p => p.name.startsWith('@nve') && !p.name.startsWith('@nve-internals') && p.version !== '0.0.0')
    .map(p => p.name);
}
