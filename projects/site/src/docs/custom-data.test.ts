// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DOCUMENTATION_BASE_URL = 'https://nvidia.github.io/elements/';
const CUSTOM_DATA_SCHEMA_URL =
  'https://raw.githubusercontent.com/microsoft/vscode-html-languageservice/main/docs/customData.schema.json';
const DOCUMENTATION_ROOT = import.meta.dirname;
const PROJECTS_ROOT = resolve(DOCUMENTATION_ROOT, '../../..');

interface ComponentDocumentation {
  tag: string;
  url: string;
}

interface CustomDataReference {
  name: string;
  url: string;
}

interface CustomDataTag {
  name: string;
  references?: CustomDataReference[];
}

interface HtmlCustomData {
  $schema: string;
  tags?: CustomDataTag[];
  version: number;
}

interface CustomElementDeclaration {
  metadata?: Record<string, unknown>;
  tagName?: string;
}

interface CustomElementsManifest {
  modules: {
    declarations?: CustomElementDeclaration[];
  }[];
}

interface ProjectPackage {
  customElements?: string;
  name?: string;
}

describe('HTML Custom Data references', () => {
  it('uses the V1 reference shape with valid HTTPS URLs', async () => {
    for (const customData of await getCustomData()) {
      expect(customData.$schema).toBe(CUSTOM_DATA_SCHEMA_URL);
      expect(customData.version).toBe(1.1);

      for (const tag of customData.tags ?? []) {
        for (const reference of tag.references ?? []) {
          expect(reference).toMatchObject({
            name: expect.any(String),
            url: expect.any(String)
          });
          expect(new URL(reference.url).protocol).toBe('https:');
        }
      }
    }
  });

  it('maps CEM ARIA metadata to the WAI-ARIA Reference label', async () => {
    const declarationsByTag = await getManifestDeclarations();
    const customDataTagsByName = new Map(
      (await getCustomData()).flatMap(customData => (customData.tags ?? []).map(tag => [tag.name, tag]))
    );

    for (const [tagName, declaration] of declarationsByTag) {
      const url = declaration.metadata?.aria;
      if (!isHttpsUrl(url)) {
        continue;
      }

      expect(customDataTagsByName.get(tagName)?.references).toContainEqual({ name: 'WAI-ARIA Reference', url });
    }
  });

  it('generates canonical references for every documented public tag', async () => {
    const documentation = await getComponentDocumentation();
    const declarationsByTag = await getManifestDeclarations();
    const customDataTagsByName = new Map(
      (await getCustomData()).flatMap(customData => (customData.tags ?? []).map(tag => [tag.name, tag]))
    );

    expect(documentation.length).toBeGreaterThan(0);

    for (const component of documentation) {
      expect(declarationsByTag.get(component.tag)?.metadata?.documentation).toBe(component.url);

      const tag = customDataTagsByName.get(component.tag);
      expect(tag?.references).toContainEqual({ name: 'Documentation', url: component.url });

      const url = new URL(component.url);
      expect(url.origin).toBe('https://nvidia.github.io');
      expect(url.pathname).toMatch(/^\/elements\/docs\//);
    }
  });
});

async function getComponentDocumentation(): Promise<ComponentDocumentation[]> {
  const files = [
    ...(await getTopLevelMarkdownFiles(join(DOCUMENTATION_ROOT, 'elements'))),
    join(DOCUMENTATION_ROOT, 'elements/data-grid/index.md'),
    ...(await getTopLevelMarkdownFiles(join(DOCUMENTATION_ROOT, 'code'))),
    ...(await getTopLevelMarkdownFiles(join(DOCUMENTATION_ROOT, 'monaco'))),
    ...(await getTopLevelMarkdownFiles(join(DOCUMENTATION_ROOT, 'media'))),
    join(DOCUMENTATION_ROOT, 'markdown/index.md')
  ];

  const documentation = await Promise.all(
    files.map(async file => {
      const content = await readFile(file, 'utf8');
      const tags = [
        content.match(/tag:\s*'([^']+)'/)?.[1],
        ...[...(content.match(/associatedElements:\s*\[([\s\S]*?)\]/)?.[1]?.matchAll(/'([^']+)'/g) ?? [])].map(
          match => match[1]
        )
      ].filter((tag): tag is string => !!tag);

      return tags.map(tag => ({ tag, url: getDocumentationUrl(file) }));
    })
  );

  return [...new Map(documentation.flat().map(component => [component.tag, component])).values()];
}

async function getCustomData(): Promise<HtmlCustomData[]> {
  const customData = await Promise.all(
    (await getElementsPackages()).map(async ({ customElements, directory }) => {
      try {
        const dataPath = join(directory, dirname(customElements), 'data.html.json');
        return JSON.parse(await readFile(dataPath, 'utf8')) as HtmlCustomData;
      } catch {
        return null;
      }
    })
  );

  return customData.filter((data): data is HtmlCustomData => data !== null);
}

async function getManifestDeclarations(): Promise<Map<string, CustomElementDeclaration>> {
  const manifests = await Promise.all(
    (await getElementsPackages()).map(async ({ customElements, directory }) => {
      return JSON.parse(await readFile(join(directory, customElements), 'utf8')) as CustomElementsManifest;
    })
  );

  return new Map(
    manifests.flatMap(manifest =>
      manifest.modules.flatMap(module =>
        (module.declarations ?? [])
          .filter((declaration): declaration is CustomElementDeclaration & { tagName: string } => !!declaration.tagName)
          .map(declaration => [declaration.tagName, declaration])
      )
    )
  );
}

async function getElementsPackages(): Promise<{ customElements: string; directory: string }[]> {
  const directories = await readdir(PROJECTS_ROOT, { withFileTypes: true });
  const packages = await Promise.all(
    directories
      .filter(directory => directory.isDirectory())
      .map(async directory => {
        const projectDirectory = join(PROJECTS_ROOT, directory.name);
        try {
          const packageJson = JSON.parse(
            await readFile(join(projectDirectory, 'package.json'), 'utf8')
          ) as ProjectPackage;
          return packageJson.name?.startsWith('@nvidia-elements/') && packageJson.customElements
            ? { customElements: packageJson.customElements, directory: projectDirectory }
            : null;
        } catch {
          return null;
        }
      })
  );

  return packages.filter((project): project is { customElements: string; directory: string } => project !== null);
}

async function getTopLevelMarkdownFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => join(directory, entry.name));
  } catch {
    return [];
  }
}

function getDocumentationUrl(file: string): string {
  const filePath = relative(DOCUMENTATION_ROOT, file).replace(/\.md$/, '');
  const route = filePath.endsWith('/index') ? filePath.slice(0, -'/index'.length) : filePath;
  return new URL(`docs/${route}/`, DOCUMENTATION_BASE_URL).href;
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
