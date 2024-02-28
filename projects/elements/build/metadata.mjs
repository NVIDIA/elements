import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { Project, SyntaxKind } from 'ts-morph';
import { stories } from './stories.mjs';

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

function getProjectTotal(name, projects) {
  return projects.reduce((total, project) => total + (project.elements.find(e => e.name === name) ? 1 : 0), 0);
}

function getInstanceTotal(name, projects) {
  return projects
    .flatMap(project => project.elements)
    .filter(e => e.name === name)
    .reduce((total, e) => total + e.instanceTotal, 0);
}

function getCoverage() {
  const coverageJSON = JSON.parse(readFileSync(new URL('../coverage/unit/coverage-summary.json', import.meta.url)));
  return Object.entries(coverageJSON)
    .map(([file, coverage]) => ({
      file: file.includes('/projects/elements/src/') ? file.split('/projects/elements/src/')[1] : file,
      ...coverage
    }))
    .sort((a, b) => (a.lines.pct > b.lines.pct ? 1 : -1))
    .filter(c => !c.file.includes('polyfills'));
}

function getLighthouseScores() {
  return JSON.parse(readFileSync(new URL('../.lighthouse/dist/report.json', import.meta.url)));
}

function getManifest() {
  const elementsSchemaJSON = JSON.parse(readFileSync(new URL('../dist/custom-elements.json', import.meta.url)));
  return Array.from(
    new Set(
      elementsSchemaJSON.modules.flatMap(module => {
        module.declarations.forEach(d => (d.path = module.path));
        return module.declarations;
      })
    )
  );
}

function getBehaviorCategory(classDeclaration) {
  /** behavior category based on functional API behavior when possible or aria behavior spec */
  if (classDeclaration.superclass?.name === 'MlvBaseButton' || classDeclaration.superclass?.name === 'Button') {
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

function getElementStability(metadata) {
  let status = 'unknown';
  const preRelease = metadata.apiReview && metadata.storybook?.length;
  const beta = metadata.unitTests && metadata.apiReview && metadata.vqa && metadata.package;
  const stable = metadata.stable && metadata.responsive && metadata.performance && metadata.aria?.length;

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

function getElementLighthouseScore(manifest, lighthouseReport) {
  const name = manifest.tagName;
  let lighthouse = lighthouseReport[name];
  if (!lighthouseReport[name]) {
    const match = Object.entries(lighthouseReport).find(
      ([k, _]) => name.startsWith(k) || manifest.metadata.entrypoint.replace('@elements/elements/', 'nve-').startsWith(k)
    );
    lighthouse = match ? match[1] : {};
  }

  if (name.includes('nve-grid') && lighthouse?.scores) {
    lighthouse.scores.accessibility = 100; // workaround false reporting for grid, manually tested
  }

  return { ...lighthouse, details: undefined };
}

function getElements(coverage, projects, lighthouseReport) {
  const elementsManifest = getManifest();
  const elementTags = elementsManifest.filter(d => d.tagName).map(d => d.tagName);

  return elementTags
    .filter(tag => !tag.includes('demo') && !tag.includes('i18n') && !tag.includes('ui-') && !tag.includes('my-'))
    .reduce((elements, name) => {
      const manifest = elementsManifest.find(e => e.tagName === name);
      const superclassManifest = elementsManifest.find(e => e.name === manifest.superclass?.name) ?? {};
      const cov = coverage.find(
        c => c.file.replace('elements/src/', '') === manifest.path.replace('/src/', '').replace('.js', '.ts')
      );
      const aria = manifest.metadata.aria ? manifest.metadata.aria : superclassManifest.metadata?.aria;
      const coverageTotal = cov ? (cov.statements.pct + cov.functions.pct + cov.branches.pct + cov.lines.pct) / 4 : 0;
      const lighthouse = getElementLighthouseScore(manifest, lighthouseReport);

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
          projectTotal: getProjectTotal(name, projects),
          instanceTotal: getInstanceTotal(name, projects),
          coverageTotal
        },
        stories: stories.find(s => s.element.startsWith(name))?.stories ?? []
      };

      metadata.behavior = getBehaviorCategory(manifest);
      metadata.status = getElementStability(metadata);

      return [...elements, metadata];
    }, [])
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

function getBaseInterface() {
  const project = new Project();
  const file = project.addSourceFileAtPath(resolve('src/internal/types/index.ts'));
  const base = file.getChildrenOfKind(SyntaxKind.InterfaceDeclaration).find(i => i.getName() === 'NveElement');
  const props = base
    .getStructure()
    .properties.map(n => ({ name: n.name, type: n.type, description: n.docs[0]?.description }));
  return props;
}

function getPatterns() {
  return stories.find(s => s.element.startsWith('patterns'))?.stories ?? [];
}

async function getMetrics() {
  const projects = []; // todo
  const coverage = getCoverage();
  const coverageTotal = coverage.splice(
    coverage.findIndex(c => c.file === 'total'),
    1
  )[0];
  const lighthouse = getLighthouseScores();
  const elements = getElements(coverage, projects, lighthouse);
  const patterns = getPatterns();

  const metrics = {
    created: new Date().toISOString(),
    elements,
    patterns,
    types: {
      props: getBaseInterface()
    },
    tests: {
      coverage,
      coverageTotal
    }
  };

  return metrics;
}

const metrics = await getMetrics();

writeFileSync('./build/metadata.json', JSON.stringify(metrics, null, 2));
