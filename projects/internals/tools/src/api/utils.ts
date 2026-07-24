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

declare const __ELEMENTS_REGISTRY_URL__: string;

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

interface TokenFilterOptions {
  query?: string;
}

function tokenMatchesQuery(token: Token, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [token.name, token.value, token.description].some(value => value.toLowerCase().includes(normalizedQuery));
}

export function getContextTokens(
  format: 'markdown' | 'json',
  tokens: Token[],
  { query = '' }: TokenFilterOptions = {}
): string | Token[] | undefined {
  const filteredTokens = distillTokens(tokens).filter(token => tokenMatchesQuery(token, query));

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

const NVE_LAYOUT_EXAMPLE = /* html */ `
<!-- import path layout styles -->
<style>
  @import "@nvidia-elements/styles/layout.css";
</style>

<!-- inline row layout -->
<section nve-layout="row gap:sm">
  <div></div>
  <div></div>
  <div></div>
</section>

<!-- stacked column layout -->
<section nve-layout="column gap:sm">
  <div></div>
  <div></div>
  <div></div>
</section>

<!-- 12 column grid layout with 6 column span -->
<section nve-layout="grid gap:sm span-items:6">
  <div>columns 1-6</div>
  <div>columns 7-12</div>
</section>

<!-- 12 column grid layout with variable column span -->
<section nve-layout="grid gap:sm">
  <div nve-layout="span:4">columns 1-4</div>
  <div nve-layout="span:8">columns 5-12</div>
</section>`;

const NVE_TEXT_EXAMPLE = /* html */ `
<!-- import path typography styles -->
<style>
  @import "@nvidia-elements/styles/typography.css";
</style>

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

function getAttributeExampleContext(attribute: Attribute) {
  if (attribute.name === 'nve-layout') {
    return NVE_LAYOUT_EXAMPLE;
  } else if (attribute.name === 'nve-text') {
    return NVE_TEXT_EXAMPLE;
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

const NPM_REGISTRY_URL = __ELEMENTS_REGISTRY_URL__;

/* istanbul ignore next -- @preserve */
let versions: ElementVersions | null = null;
/* istanbul ignore next -- @preserve */
export async function getLatestPublishedVersions(projects: Project[]): Promise<ElementVersions> {
  if (!versions) {
    const names = getPublishedPackageNames(projects);
    const packageFiles = await Promise.all(
      names.map(async name => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const url = `${NPM_REGISTRY_URL}/${name}/latest`;
        return fetch(url, { signal: controller.signal })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch ${name} from ${NPM_REGISTRY_URL}: ${res.status} ${res.statusText}`);
            }
            return res.json();
          })
          .catch(() => {
            const message = `Could not fetch latest version from ${url}`;
            if (process.env.ELEMENTS_ENV === 'mcp') {
              throw new Error(message);
            } else {
              console.warn(message);
              return { name, version: '0.0.0' };
            }
          })
          .finally(() => clearTimeout(timeout));
      })
    );
    versions = packageFiles.reduce(
      (acc: Record<string, string>, pkg: { name: string; version: string }) => ({ ...acc, [pkg.name]: pkg.version }),
      {}
    ) as ElementVersions;
  }
  return versions!;
}

export function getPublishedProjects(projects: Project[]): Project[] {
  return projects.filter(
    p =>
      p.name.startsWith('@nvidia-elements') && !p.name.startsWith('@internals') && p.version !== '0.0.0' && !p.private
  );
}

export function getPublishedPackageNames(projects: Project[]) {
  return getPublishedProjects(projects).map(p => p.name);
}
