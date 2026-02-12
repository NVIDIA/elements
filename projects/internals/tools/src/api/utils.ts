import {
  ApiService,
  type Attribute,
  type Project,
  type Element,
  type Token,
  type ProjectTypes
} from '@internals/metadata';
import { wrapText } from '../internal/utils.js';

export interface PartialAPIResult {
  name: string;
  description: string;
  behavior: string;
}

export function getPublicAPIs(
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
    return `- **${e.name}${behavior}** ${wrapText(e.description)}`;
  });

  const attributesResult = metadata.data.attributes
    .filter(a => a.description)
    .map(a => ({ name: a.name, description: a.description, behavior: 'attribute' }));
  const attributesMarkdown = attributesResult.map(a => `- **${a.name} (${a.behavior})**: ${wrapText(a.description)}`);

  if (format === 'markdown') {
    return [...elementsMarkdown, ...attributesMarkdown].join('\n');
  } else if (format === 'json') {
    return { elements: elementsResult, attributes: attributesResult };
  }
}

export async function searchPublicAPIs(query: string, config: { limit?: number } = { limit: 100 }) {
  const data = (await ApiService.search(query)).map(r => {
    if ((r as Element).manifest) {
      (r as Element).changelog = undefined;
      (r as Element).manifest.metadata.markdown = undefined;
    }
    return r;
  });
  return config.limit !== undefined ? data.slice(0, config.limit) : data;
}

export async function findPublicAPIChangelog(name: string): Promise<string | undefined> {
  const data = await ApiService.search(name);
  const result = data.find(r => r.name === name) as Element | (Attribute & { changelog: string }) | undefined;
  return result?.changelog ?? JSON.stringify(result, null, 2);
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
    const packageFiles = await Promise.all(
      names.map(name => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        return fetch(`https://https://esm.sh/${name}@latest/package.json`, { signal: controller.signal })
          .then(res => {
            clearTimeout(timeout);
            return res.json();
          })
          .catch(() => {
            const message = 'Could not fetch latest versions from https://https://esm.sh';
            if (process.env.ELEMENTS_ENV === 'mcp') {
              throw new Error(message);
            } else {
              console.warn(message);
              return { name, version: '0.0.0' };
            }
          });
      })
    );
    versions = packageFiles.reduce((acc: Record<string, string>, pkg) => ({ ...acc, [pkg.name]: pkg.version }), {});
  }
  return versions;
}

export function getPublishedPackageNames(projects: Project[]) {
  return projects
    .filter(p => p.name.startsWith('@nve') && !p.name.startsWith('@internals') && p.version !== '0.0.0')
    .map(p => p.name);
}
