import { ApiService, type Attribute, type Element, type Token, type ProjectTypes } from '@internals/metadata';
import { type Project } from '@internals/metadata';
import { wrapText } from '../internal/utils.js';

declare const __ELEMENTS_ESM_CDN_BASE_URL__: string;

/**
 * This file is for utilities that prune/curate the APIs for agents. Many APIs create context noise for agents
 * that cause significant output quality issues. Providing a subset of the APIs produces more reliable results.
 */

export interface PartialAPIResult {
  name: string;
  description: string;
  behavior: string;
}

export function getContextAPIs(
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

export async function searchContextAPIs(query: string, config: { limit?: number } = { limit: 100 }) {
  const data = (await ApiService.search(query)).map((r: Element | Attribute) => {
    const el = r as Element;
    if (el.manifest) {
      el.changelog = undefined;
      el.manifest.metadata.markdown = '';
    }

    const attr = r as Attribute;
    if (attr.values) {
      attr.values = attr.values.filter(v => !isComplexAttributeValue(v.name));
      attr.markdown = attributeMetadataToMarkdown(attr);
    }
    return r;
  });
  return config.limit !== undefined ? data.slice(0, config.limit) : data;
}

/**
 * Provides a subset of tokens to agents for theming. Narrowing choice produced more reliable results.
 * Tokens which are of low frequency of editing/usage or at the edges of scales create context noise.
 */
export function getContextTokens(format: 'markdown' | 'json', tokens: Token[]): string | Token[] | undefined {
  const complexTokenPatterns = [
    'nve-config-',
    'ref-color',
    'ref-scale',
    'ref-opacity',
    'ref-outline',
    'ref-font-family-',
    'sys-color-scheme',
    'sys-contrast',
    'line-height',
    'ratio',
    '-xxx',
    '-xx'
  ];

  const filteredTokens: Token[] = tokens
    .filter(token => !complexTokenPatterns.some(pattern => token.name.includes(pattern)))
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

export function attributeMetadataToMarkdown(attribute: Attribute) {
  const exampleContext = getAttributeExampleContext(attribute);
  const filteredValues = attribute.values.filter(v => !isComplexAttributeValue(v.name));
  return `
## ${attribute.name}

${attribute.description}

### Example

${exampleContext ? `\`\`\`html\n${exampleContext.trim()}\n\`\`\`` : 'No example available.'}

### Values

| name | type | value  |
| ---- | ---- | ------ |
| \`${attribute.name}\` | \`string\` |${filteredValues.map(value => `\`${value.name}\``).join(', ')} |`.trim();
}

function getAPIDescriptionMarkdown(api: PartialAPIResult) {
  const description = (api.description ?? '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return wrapText(description).trim();
}

/**
 * Provides a subset of attribute values to agents. Narrowing choice produces drastically more reliable results.
 * Values which are of low frequency of editing/usage, unreliable naming, or at the edges of scales create significant context noise.
 * This filter removes noisy values to produce a more focused and reliable set.
 */
function isComplexAttributeValue(value: string) {
  return [
    // system
    'debug',
    'mkd',
    'md',
    // layout
    '|',
    '@',
    '&',
    'xx', // excessive scale boundary
    ':none', // ambiguous override
    // typography (non-semantic)
    'display',
    'eyebrow',
    'white',
    'black',
    // typography (visually ambiguous)
    'line-height-',
    'tight',
    'snug',
    'moderate',
    'relaxed',
    'loose',
    'flat'
  ].some(p => value.includes(p));
}

function getAttributeExampleContext(attribute: Attribute) {
  if (attribute.name === 'nve-layout') {
    return /* html */ `
<section nve-layout="row gap:sm">
  <div></div>
  <div></div>
  <div></div>
</section>
<section nve-layout="column gap:sm">
  <div></div>
  <div></div>
  <div></div>
</section>
<section nve-layout="grid gap:sm span-items:6">
  <div>columns 1-6</div>
  <div>columns 7-12</div>
</section>`;
  } else if (attribute.name === 'nve-text') {
    return /* html */ `
<h1 nve-text="heading">heading</h1>
<p nve-text="body">body</p>
<p nve-text="label">label</p>

<h2 nve-text="heading lg">heading large</h2>
<h2 nve-text="heading sm">heading small</h2>
<p nve-text="body sm">body content small</p>
<p nve-text="body lg">body content large</p>

<p nve-text="monospace">monospace</p>
<code nve-text="code">code</code>
<p nve-text="nowrap">nowrap</p>

<p nve-text="muted">muted</p>
<p nve-text="emphasis">emphasis</p>

<p nve-text="start">start</p>
<p nve-text="center">center</p>
<p nve-text="end">end</p>`;
  }
  return attribute.example ?? '';
}

export interface ElementVersions {
  '@nvidia-elements/core': string;
  '@nvidia-elements/styles': string;
  '@nvidia-elements/themes': string;
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
      names.map(async name => {
        if (!__ELEMENTS_ESM_CDN_BASE_URL__?.length) {
          return Promise.resolve({ name, version: '0.0.0' });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        return fetch(`${__ELEMENTS_ESM_CDN_BASE_URL__}/${name}@latest/package.json`, { signal: controller.signal })
          .then(res => {
            clearTimeout(timeout);
            return res.json();
          })
          .catch(() => {
            const message = `Could not fetch latest versions from ${__ELEMENTS_ESM_CDN_BASE_URL__}`;
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
