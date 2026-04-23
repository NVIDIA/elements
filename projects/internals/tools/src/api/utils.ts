// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiService, type Attribute, type Element, type Token, type ProjectTypes } from '@internals/metadata';
import { type Project } from '@internals/metadata';
import { wrapText } from '../internal/utils.js';
import {
  distillElements,
  distillAttributes,
  distillTokens,
  distillAttributeValues,
  distillSearchResult,
  type PartialAPIResult
} from '../distill/apis.js';

export type { PartialAPIResult } from '../distill/apis.js';

declare const __ELEMENTS_ESM_CDN_BASE_URL__: string;

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
  const elementsResult = distillElements(metadata.data.elements);
  const elementsMarkdown = elementsResult.map(e => {
    const behavior = e.behavior ? ` (${e.behavior})` : '';
    return `\`${e.name}\`${behavior}: ${getAPIDescriptionMarkdown(e)}`;
  });

  const attributesResult = distillAttributes(metadata.data.attributes);
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
    const result = distillSearchResult(r);

    const attr = result as Attribute;
    if (attr.values) {
      attr.markdown = attributeMetadataToMarkdown(attr);
    }
    return result;
  });
  return config.limit !== undefined ? data.slice(0, config.limit) : data;
}

export function getContextTokens(format: 'markdown' | 'json', tokens: Token[]): string | Token[] | undefined {
  const filteredTokens = distillTokens(tokens);

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
  const filteredValues = distillAttributeValues(attribute.values);
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
    .filter(p => p.name.startsWith('@nvidia-elements') && !p.name.startsWith('@internals') && p.version !== '0.0.0')
    .map(p => p.name);
}
