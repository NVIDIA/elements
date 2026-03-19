// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { type InterfaceDeclaration, type JSDocStructure, type OptionalKind, Project, SyntaxKind } from 'ts-morph';
import type {
  CustomElementsManifest,
  CustomElementManifest,
  Package,
  ProjectTypes,
  Element,
  Token,
  Attribute
} from '../types.js';
import { attributeMetadataToMarkdown, getElementChangelog } from '../utils/utils.ts';

const BASE_ELEMENT_INTERFACE_PATH = resolve('../../elements/src/internal/types/index.ts');

function getPackageFile(basePath: string): Package {
  return JSON.parse(readFileSync(new URL(basePath + '/package.json', import.meta.url), 'utf8'));
}

function getChangelog(basePath: string): string {
  const changelog = existsSync(new URL(basePath + '/CHANGELOG.md', import.meta.url))
    ? readFileSync(new URL(basePath + '/CHANGELOG.md', import.meta.url), 'utf8')
    : '';
  return changelog.includes('@maglev') ? (changelog.split('@maglev')[0] ?? '') : changelog;
}

function getManifestDeclarations(customElementsManifest: CustomElementsManifest): CustomElementManifest[] {
  return Array.from(
    new Set(
      customElementsManifest.modules.flatMap(module => {
        module.declarations.forEach(d => (d.path = module.path));
        return module.declarations;
      })
    )
  ).filter(d => d.tagName);
}

function getCustomElementsManifest(basePath: string): CustomElementsManifest | null {
  const customElementsManifestPath = new URL(basePath + '/dist/custom-elements.json', import.meta.url);
  return existsSync(customElementsManifestPath)
    ? JSON.parse(readFileSync(new URL(customElementsManifestPath, import.meta.url), 'utf8'))
    : null;
}

function getGlobalAttributes(basePath: string): Attribute[] {
  const htmlDataPath = new URL(basePath + '/dist/data.html.json', import.meta.url);
  const globalAttributes: Attribute[] = existsSync(htmlDataPath)
    ? (JSON.parse(readFileSync(new URL(htmlDataPath, import.meta.url), 'utf8'))?.globalAttributes ?? [])
    : [];

  globalAttributes.forEach(attribute => {
    attribute.markdown = attributeMetadataToMarkdown(attribute);
  });

  return globalAttributes;
}

function getElementsStandardAPIProperties(): ProjectTypes[] {
  const project = new Project();
  const file = project.addSourceFileAtPath(BASE_ELEMENT_INTERFACE_PATH);
  const base = file
    .getChildrenOfKind(SyntaxKind.InterfaceDeclaration)
    .find(i => i.getName() === 'NveElement') as InterfaceDeclaration;
  const props = base?.getStructure()?.properties?.map(n => ({
    name: n.name,
    type: n.type,
    description: n.docs ? (n.docs[0] as OptionalKind<JSDocStructure>)?.description : ''
  })) as ProjectTypes[];
  return props ?? [];
}

function getTokens(): Token[] {
  const tokensJSON: { name: string; value: string; type?: string; description?: string }[] = JSON.parse(
    readFileSync(new URL('../../../../themes/dist/index.metadata.json', import.meta.url), 'utf8')
  );

  return tokensJSON.map(token => {
    let value = token.value;
    if (value.includes('ref-scale')) {
      value = (value.split(' * ')[1] ?? '').replace(')', '').trim();
    }

    if (value.includes('nve')) {
      value = `var(--${value})`;
    }

    return {
      name: `--${token.name}`,
      value,
      description: token.description ?? ''
    };
  });
}

function getProjectElements(basePath: string): Element[] {
  const packageFile = getPackageFile(basePath);
  const changelogFile = getChangelog(basePath);
  const customElementsManifest = getCustomElementsManifest(basePath);
  const elementDeclarations = customElementsManifest ? getManifestDeclarations(customElementsManifest) : [];

  return elementDeclarations
    .map(d => d.tagName)
    .reduce((elements: Element[], name: string) => {
      const manifest = elementDeclarations.find(e => e.tagName === name);
      const markdown = manifest?.metadata?.markdown ?? '';
      const changelog = getElementChangelog(name, changelogFile);
      const metadata: Element = {
        name,
        package: packageFile.name,
        version: packageFile.version,
        markdown,
        changelog,
        manifest
      };

      return [...elements, metadata];
    }, [])
    .sort((a: Element, b: Element) => (a.name < b.name ? -1 : 1));
}

export async function getApi(): Promise<{
  created: string;
  data: {
    elements: Element[];
    attributes: Attribute[];
    tokens: Token[];
    types: ProjectTypes[];
  };
}> {
  const projects = [
    '../../../../elements',
    '../../../../styles',
    '../../../../themes'
  ];

  const types = getElementsStandardAPIProperties();
  const attributes = projects.flatMap(project => getGlobalAttributes(project));
  const elements = projects.flatMap(project => getProjectElements(project));
  const tokens = getTokens();

  return {
    created: new Date().toISOString(),
    data: { elements, attributes, tokens, types }
  };
}
