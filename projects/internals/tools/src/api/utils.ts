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
    .filter(e => !e.manifest?.deprecated && e.manifest?.description)
    .map(e => ({ name: e.name, description: e.manifest!.description, behavior: e.manifest!.metadata?.behavior ?? '' }));
  const elementsMarkdown = elementsResult.map(e => {
    const behavior = e.behavior ? ` (${e.behavior})` : '';
    return `\`${e.name}\`${behavior}: ${getAPIDescriptionMarkdown(e)}`;
  });

  const attributesResult = metadata.data.attributes
    .filter(a => a.description && a.example)
    .map(a => ({ name: a.name, description: a.description, behavior: 'attribute' }));
  const attributesMarkdown = attributesResult.map(
    a => `\`${a.name}\` (${a.behavior}): ${getAPIDescriptionMarkdown(a)}`
  );

  if (format === 'markdown') {
    return [...elementsMarkdown, ...attributesMarkdown].join('\n\n');
  } else if (format === 'json') {
    return { elements: elementsResult, attributes: attributesResult };
  }
  return '';
}

export function getAPIDescriptionMarkdown(api: PartialAPIResult) {
  const description = (api.description ?? '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return wrapText(description).trim();
}

export async function searchPublicAPIs(query: string, config: { limit?: number } = { limit: 100 }) {
  const data = (await ApiService.search(query)).map((r: Element | Attribute) => {
    const el = r as Element;
    if (el.manifest) {
      el.changelog = undefined;
      el.manifest.metadata.markdown = '';
    }
    return r;
  });
  return config.limit !== undefined ? data.slice(0, config.limit) : data;
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
        return fetch(`https://esm.nvidia.com/${name}@latest/package.json`, { signal: controller.signal })
          .then(res => {
            clearTimeout(timeout);
            return res.json();
          })
          .catch(() => {
            const message = 'Could not fetch latest versions from https://esm.nvidia.com';
            if (process.env.ELEMENTS_ENV === 'mcp') {
              throw new Error(message);
            } else {
              console.warn(message);
              return { name, version: '0.0.0' };
            }
          });
      })
    );
    versions = packageFiles.reduce(
      (acc: Record<string, string>, pkg: { name: string; version: string }) => ({ ...acc, [pkg.name]: pkg.version }),
      {}
    ) as ElementVersions;
  }
  return versions!;
}

export function getPublishedPackageNames(projects: Project[]) {
  return projects
    .filter(p => p.name.startsWith('@nve') && !p.name.startsWith('@internals') && p.version !== '0.0.0')
    .map(p => p.name);
}

export function getSemanticTokens(format: 'markdown' | 'json', tokens: Token[]): string | Token[] | undefined {
  const filteredTokens: Token[] = tokens
    .filter(
      token =>
        !token.name.includes('nve-config-') &&
        !token.name.includes('ref-color') &&
        !token.name.includes('ref-scale') &&
        !token.name.includes('ref-opacity') &&
        !token.name.includes('ref-outline') &&
        !token.name.includes('ref-font-family-') &&
        !token.name.includes('sys-color-scheme') &&
        !token.name.includes('sys-contrast') &&
        !token.name.includes('line-height') &&
        !token.name.includes('ratio') &&
        !token.name.includes('-xxx') &&
        !token.name.includes('-xx')
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  if (format === 'markdown') {
    return `## CSS Variables\n\nAvailable semantic design tokens for theming.
| name     | value | Description |
| -------- | ----- | ----------- |
${filteredTokens.map(token => `| ${token.name} | ${token.value} | ${token.description} |`).join('\n')}`;
  } else if (format === 'json') {
    return filteredTokens;
  }

  return undefined;
}
