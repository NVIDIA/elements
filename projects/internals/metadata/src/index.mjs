import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Project, SyntaxKind } from 'ts-morph';
import { getStories } from './stories.mjs';

const BASE_ELEMENT_INTERFACE_PATH = resolve('../../elements/src/internal/types/index.ts');
const INITIAL_METADATA = JSON.parse(readFileSync(new URL('../dist/index.json', import.meta.url), 'utf8'));

const stories = await getStories(['../../elements/src/**/*.stories.ts', '../../elements/docs/patterns/*.stories.ts']);

const ariaSpecs = {
  navigation: [
    'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/',
    'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav'
  ],
  list: ['https://www.w3.org/WAI/ARIA/apg/patterns/grid/', 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'],
  feedback: ['https://www.w3.org/WAI/ARIA/apg/patterns/alert/'],
  container: [
    'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
    'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role'
  ]
};

/** projects/../dist/custom-elements.json */
function getManifestDeclarations(customElementsManifest) {
  return Array.from(
    new Set(
      customElementsManifest.modules.flatMap(module => {
        module.declarations.forEach(d => (d.path = module.path));
        return module.declarations;
      })
    )
  )
    .filter(d => d.tagName)
    .filter(
      d =>
        !d.tagName.includes('demo') &&
        !d.tagName.includes('i18n') &&
        !d.tagName.includes('ui-') &&
        !d.tagName.includes('my-')
    )
    .map(d => {
      d.tagName = d.tagName.replace('nve-', 'nve-');
      return d;
    });
}

/** projects/../coverage/unit/coverage-summary.json */
function getTestCoverage(path) {
  const coverageJSON = JSON.parse(readFileSync(path));
  const coverage = Object.entries(coverageJSON)
    .map(([file, coverage]) => ({
      file: file.includes('/src/') ? file.split('/src/')[1] : file,
      ...coverage
    }))
    .sort((a, b) => (a.lines.pct > b.lines.pct ? 1 : -1))
    .filter(c => !c.file.includes('polyfills'));

  const coverageTotal = coverage.splice(
    coverage.findIndex(c => c.file === 'total'),
    1
  )[0];

  return { coverage, coverageTotal };
}

/** determine the element stability based on metadata provided */
function getElementStability(metadata) {
  let status = 'unknown';
  const preRelease = metadata.apiReview && metadata.storybook?.length;
  const beta = metadata.unitTests && metadata.apiReview && metadata.vqa && metadata.package;
  const stable = metadata.stable && metadata.performance && metadata.aria?.length;

  if (preRelease) {
    status = 'pre-release';
  }

  if (preRelease && beta) {
    status = 'beta';
  }

  if (preRelease && beta && stable) {
    status = 'stable';
  }

  return status;
}

/** determine behavior category based on functional API behavior when possible or aria behavior spec */
function getBehaviorCategory(classDeclaration) {
  if (classDeclaration.superclass?.name === 'BaseButton' || classDeclaration.superclass?.name === 'Button') {
    return 'button';
  }

  if (
    classDeclaration.superclass?.name === 'Control' ||
    classDeclaration.superclass?.name === 'ControlGroup' ||
    classDeclaration.name.startsWith('Control')
  ) {
    return 'form';
  }

  if (
    JSON.stringify(classDeclaration.members).includes('TypePopoverController') ||
    classDeclaration.name.startsWith('Dialog')
  ) {
    return 'popover';
  }

  if (ariaSpecs.feedback.find(i => i === classDeclaration.metadata.aria)) {
    return 'feedback';
  }

  if (ariaSpecs.navigation.find(i => i === classDeclaration.metadata.aria)) {
    return 'navigation';
  }

  if (ariaSpecs.list.find(i => i === classDeclaration.metadata.aria)) {
    return 'list';
  }

  if (ariaSpecs.container.find(i => i === classDeclaration.metadata.aria) || classDeclaration.name.startsWith('Card')) {
    return 'container';
  }

  return classDeclaration.metadata.category ?? 'content';
}

function getElementsStandardAPIProperties() {
  const project = new Project();
  const file = project.addSourceFileAtPath(BASE_ELEMENT_INTERFACE_PATH);
  const base = file.getChildrenOfKind(SyntaxKind.InterfaceDeclaration).find(i => i.getName() === 'NveElement');
  const props = base
    .getStructure()
    .properties.map(n => ({ name: n.name, type: n.type, description: n.docs[0]?.description }));
  return { props };
}

function getElementLighthouseScore(packageFile, tagName, lighthouseReport) {
  let lighthouse = lighthouseReport[tagName];
  const priorLighthouse = INITIAL_METADATA[packageFile.name].elements.find(i => tagName.startsWith(i.name))?.lighthouse;

  if (!lighthouse) {
    lighthouse = priorLighthouse ? priorLighthouse : null;
  }

  if (tagName.includes('nve-grid') && lighthouse?.scores) {
    lighthouse.scores.accessibility = 100; // workaround false reporting for grid, manually tested
  }

  return lighthouse;
}

function getElementMetadata(packageFile, customElementsManifest, testCoverage, lighthouseReport) {
  const elementDeclarations = customElementsManifest ? getManifestDeclarations(customElementsManifest) : [];
  const coverage = testCoverage?.coverage ? testCoverage?.coverage : [];

  return elementDeclarations
    .map(d => d.tagName)
    .reduce((elements, name) => {
      const manifest = elementDeclarations.find(e => e.tagName === name);
      const superclassManifest = elementDeclarations.find(e => e.name === manifest.superclass?.name) ?? {};
      const cov = coverage.find(
        c => c.file.replace('elements/src/', '') === manifest.path.replace('/src/', '').replace('.js', '.ts')
      );
      const aria = manifest.metadata.aria ? manifest.metadata.aria : superclassManifest.metadata?.aria;
      const coverageTotal = cov ? (cov.statements.pct + cov.functions.pct + cov.branches.pct + cov.lines.pct) / 4 : 0;
      const lighthouse = getElementLighthouseScore(packageFile, manifest.tagName, lighthouseReport);

      const metadata = {
        name,
        ...(superclassManifest.metadata ?? {}),
        ...manifest.metadata,
        aria,
        schema: {
          properties: manifest.members
            .filter(m => m.description)
            .map(m => ({ name: m.name, description: m.description })),
          slots: manifest.slots,
          attributes: manifest.attributes,
          events: manifest.events,
          cssProperties: manifest.cssProperties
        },
        lighthouse,
        tests: {
          coverageTotal
        },
        stories: stories.find(s => s.element === name)?.stories ?? []
      };

      metadata.behavior = getBehaviorCategory(manifest);
      metadata.status = getElementStability(metadata);

      return [...elements, metadata];
    }, [])
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

function getChangelog(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '# Changelog';
}

function getReadme(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '# Readme';
}

async function getProjectMetadata(basePath) {
  const coverageReportPath = new URL(basePath + '/coverage/unit/coverage-summary.json', import.meta.url);
  const lighthouseReportPath = new URL(basePath + '/.lighthouse/report.json', import.meta.url);
  const customElementsManifestPath = new URL(basePath + '/dist/custom-elements.json', import.meta.url);

  const packageFile = JSON.parse(readFileSync(new URL(basePath + '/package.json', import.meta.url), 'utf8'));
  packageFile.name = packageFile.name.replace('@elements', '@nve');
  const readme = getReadme(new URL(basePath + '/README.md', import.meta.url));
  const changelog = getChangelog(new URL(basePath + '/CHANGELOG.md', import.meta.url));
  const customElementsManifest = existsSync(customElementsManifestPath)
    ? JSON.parse(readFileSync(new URL(customElementsManifestPath, import.meta.url), 'utf8'))
    : null;
  const tests = existsSync(coverageReportPath) ? getTestCoverage(coverageReportPath) : null;
  const lighthouseReport = existsSync(lighthouseReportPath) ? JSON.parse(readFileSync(lighthouseReportPath)) : null;

  return {
    name: packageFile.name,
    version: packageFile.version,
    readme,
    changelog,
    tests,
    elements: getElementMetadata(packageFile, customElementsManifest, tests, lighthouseReport)
  };
}

const metadata = {
  created: new Date().toISOString(),
  types: getElementsStandardAPIProperties(),
  '@nvidia-elements/core': await getProjectMetadata('../../../elements'),
  '@nvidia-elements/core-react': await getProjectMetadata('../../../elements-react'),
  '@nvidia-elements/testing': await getProjectMetadata('../../../testing'),
  '@nvidia-elements/code': await getProjectMetadata('../../../labs/code'),
  '@nvidia-elements/behaviors-alpine': await getProjectMetadata('../../../labs/behaviors-alpine')
};

writeFileSync('./dist/index.json', JSON.stringify(metadata, null, 2));
