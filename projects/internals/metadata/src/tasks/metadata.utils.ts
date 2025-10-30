import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { type InterfaceDeclaration, type JSDocStructure, type OptionalKind, Project, SyntaxKind } from 'ts-morph';
import type {
  CustomElementsManifest,
  Element,
  Package,
  Project as MetadataProject,
  ProjectTypes,
  ProjectElement,
  Token,
  Attribute
} from '../types.js';
import { attributeMetadataToMarkdown, elementMetadataToMarkdown, getElementChangelog } from '../utils/utils.ts';

const BASE_ELEMENT_INTERFACE_PATH = resolve('../../elements/src/internal/types/index.ts');

function getPackageFile(basePath: string): Package {
  return JSON.parse(readFileSync(new URL(basePath + '/package.json', import.meta.url), 'utf8'));
}

function getChangelog(basePath: string): string {
  const changelog = existsSync(new URL(basePath + '/CHANGELOG.md', import.meta.url))
    ? readFileSync(new URL(basePath + '/CHANGELOG.md', import.meta.url), 'utf8')
    : '';
  return changelog.includes('@elements') ? changelog.split('@elements')[0] : changelog;
}

function getReadMe(basePath: string): string {
  return readFileSync(new URL(basePath + '/README.md', import.meta.url), 'utf8');
}

function getManifestDeclarations(customElementsManifest: CustomElementsManifest): Element[] {
  return Array.from(
    new Set(
      customElementsManifest.modules.flatMap(module => {
        module.declarations.forEach(d => (d.path = module.path));
        return module.declarations;
      })
    )
  ).filter(d => d.tagName);
}

function getCustomElementsManifest(basePath: string): CustomElementsManifest {
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

function getElementMetadata(packageChangelog: string, customElementsManifest: CustomElementsManifest) {
  const elementDeclarations = customElementsManifest ? getManifestDeclarations(customElementsManifest) : [];

  return elementDeclarations
    .map(d => d.tagName)
    .reduce((elements: ProjectElement[], name) => {
      const manifest = elementDeclarations.find(e => e.tagName === name);
      const markdown = manifest.metadata ? elementMetadataToMarkdown(manifest) : '';
      const changelog = getElementChangelog(name, packageChangelog);
      const metadata: ProjectElement = {
        name,
        markdown,
        changelog,
        manifest
      };

      return [...elements, metadata];
    }, [])
    .sort((a, b) => (a.name < b.name ? -1 : 1));
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

async function getProjectMetadata(basePath): Promise<MetadataProject> {
  const packageFile = getPackageFile(basePath);
  const changelog = getChangelog(basePath);
  const readme = getReadMe(basePath);
  const customElementsManifest = getCustomElementsManifest(basePath);
  const attributes = getGlobalAttributes(basePath);
  let tokens: Token[] = [];

  if (packageFile.name === '@nvidia-elements/themes') {
    const tokensJSON: { [key: string]: string } = JSON.parse(
      readFileSync(new URL(basePath + '/dist/index.json', import.meta.url), 'utf8')
    );

    tokens = Object.entries(tokensJSON).map(([key, v]) => {
      let value = v;
      if (value.includes('ref-scale')) {
        value = value.split(' * ')[1].replace(')', '').trim();
      }

      if (value.includes('nve')) {
        value = `var(--nve-${value})`;
      }

      return {
        name: `--${key}`,
        value,
        description: ''
      };
    });
  }

  return {
    name: packageFile.name,
    version: packageFile.version,
    description: packageFile.description,
    readme,
    changelog,
    tokens,
    attributes,
    elements: getElementMetadata(changelog, customElementsManifest)
  };
}

export async function getMetadata() {
  const elements = await getProjectMetadata('../../../../elements');
  elements.types = getElementsStandardAPIProperties();

  return {
    created: new Date().toISOString(),
    projects: {
      '@nvidia-elements/core': elements,
      '@nvidia-elements/core-react': await getProjectMetadata('../../../../elements-react'),
      '@nvidia-elements/styles': await getProjectMetadata('../../../../styles'),
      '@nvidia-elements/testing': await getProjectMetadata('../../../../testing'),
      '@nvidia-elements/themes': await getProjectMetadata('../../../../themes'),
      '@nvidia-elements/behaviors-alpine': await getProjectMetadata('../../../../labs/behaviors-alpine'),
      '@nvidia-elements/brand': await getProjectMetadata('../../../../labs/brand'),
      '@nvidia-elements/code': await getProjectMetadata('../../../../labs/code'),
      '@nvidia-elements/cli': await getProjectMetadata('../../../../labs/cli'),
      '@nvidia-elements/lint': await getProjectMetadata('../../../../labs/lint'),
      '@nvidia-elements/forms': await getProjectMetadata('../../../../labs/forms'),
      '@nvidia-elements/markdown': await getProjectMetadata('../../../../labs/markdown'),
      '@nvidia-elements/playwright-screencast': await getProjectMetadata('../../../../labs/playwright-screencast'),
      '@nvidia-elements/monaco': await getProjectMetadata('../../../../monaco'),
      '@internals/metadata': await getProjectMetadata('../../../../internals/metadata'),
      '@internals/patterns': await getProjectMetadata('../../../../internals/patterns')
    }
  };
}
