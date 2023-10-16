import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'module';
import { Project, SyntaxKind } from 'ts-morph';
import { stories } from './stories.mjs';
const require = createRequire(import.meta.url);

const ariaSpecs = {
  navigation: [
    'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/',
    'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav',
  ],
  list: [
    'https://www.w3.org/WAI/ARIA/apg/patterns/grid/',
    'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'
  ],
  feedback: [
    'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'
  ],
  container: [
    'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
    'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role'
  ]
};

async function* getFiles(dir) {
  for (const dirent of await readdir(resolve(dir), { withFileTypes: true })) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory() && !dirent.name.includes('node_modules')) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

async function getPackageFiles(src) {
  const files = [];
  for await (const file of getFiles(src)) {
    if (file.includes('/package.json')) {
      files.push(file);
    }
  }
  return files;
}

async function getSourceFiles(src) {
  const files = [];
  for await (const file of getFiles(src)) {
    if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md') || file.endsWith('.mdx')) {
      files.push(file);
    }
  }
  return files;
}

function getProjectTotal(name, projects) {
  return projects.reduce((total, project) => (total + (project.elements.find(e => e.name === name) ? 1 : 0)), 0);
}

function getInstanceTotal(name, projects) {
  return projects.flatMap(project => project.elements).filter(e => e.name === name).reduce((total, e) => total + e.instanceTotal, 0);
}

async function getProjects() {
  const elementTags = getManifest().map(d => d.tagName);

  return Promise.all(
    (await getPackageFiles('../../../'))
      .filter(path => !path.includes('design-system') && !path.includes('dist') && !path.includes('deprecated'))
      .reduce((files, path) => {
        const data = require(path);
        return data.dependencies && data?.dependencies['@elements/elements'] ? [...files, { ...data, path }] : files;
      }, [])
      .map(file => {
        return { package: file.name, elements: file.dependencies['@elements/elements'], path: file.path.replace('/package.json', '') };
      })
      .map(async (project) => {
        const sources = await getSourceFiles(project.path);
        const elements = Object.entries(sources.reduce((tags, path) => {
          const src = readFileSync(path, 'utf8');
          elementTags.filter(tag => src.includes(tag)).forEach(tag => {
            tags[tag] = tags[tag] ? tags[tag] + 1 : 1;
          });
          return tags;
        }, {})).map(([name, instanceTotal]) => ({ name, instanceTotal })).filter(e => e.name !== 'undefined');

        return { name: project.package, path: `src/ui/${project.path.split('/src/ui/')[1]}`, elementsVersion: project.elements, elements, instanceTotal: elements.reduce((p, e) => e.instanceTotal + p, 0) };
      })
  );
}

function getCoverage() {
  const coverageJSON = require(resolve('./coverage/coverage-summary.json'));
  return Object.entries(coverageJSON)
    .map(([file, coverage]) => ({ file: file.includes('/src/ui/platform/design-system/') ? file.split('/src/ui/platform/design-system/')[1] : file, ...coverage }))
    .sort((a, b) => a.lines.pct > b.lines.pct ? 1 : -1)
    .filter(c => !c.file.includes('polyfills'));
}

function getManifest() {
  const elementsSchemaJSON = require(resolve('./dist/custom-elements.json'));
  return Array.from(new Set(elementsSchemaJSON.modules.flatMap(module => {
    module.declarations.forEach(d => d.path = module.path);
    return module.declarations;
  })));
}

function getBehaviorCategory(classDeclaration) {
  /** behavior category based on functional API behavior when possible or aria behavior spec */
  if (classDeclaration.superclass?.name === 'MlvBaseButton' || classDeclaration.superclass?.name === 'Button') {
    return 'button';
  }

  if (classDeclaration.superclass?.name === 'Control' || classDeclaration.superclass?.name === 'ControlGroup' || classDeclaration.name.startsWith('Control')) {
    return 'form';
  }

  if (JSON.stringify(classDeclaration.members).includes('TypePopoverController') || classDeclaration.name.startsWith('Dialog')) {
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

function getElements(coverage, projects) {
  const elementsManifest = getManifest();
  const elementTags = elementsManifest.filter(d => d.tagName).map(d => d.tagName);

  return elementTags.filter(tag => !tag.includes('demo') && !tag.includes('i18n') && !tag.includes('ui-') && !tag.includes('my-')).reduce((elements, name) => {
    const manifest = elementsManifest.find(e => e.tagName === name);
    const superclassManifest = elementsManifest.find(e => e.name === manifest.superclass?.name) ?? { };
    const cov = coverage.find(c => c.file.replace('elements/src/', '') === manifest.path.replace('/src/', '').replace('.js', '.ts'));
    const aria = manifest.metadata.aria ? manifest.metadata.aria : superclassManifest.metadata?.aria;
    const coverageTotal = cov ? (cov.statements.pct + cov.functions.pct + cov.branches.pct + cov.lines.pct) / 4 : 0;

    const metadata = {
      name,
      ...superclassManifest.metadata ?? { },
      ...manifest.metadata,
      aria,
      schema: {
        properties: manifest.members.filter(m => m.description).map(m => ({ name: m.name, description: m.description })),
        slots: manifest.slots,
        attributes: manifest.attributes,
        events: manifest.events,
        cssProperties: manifest.cssProperties,
      },
      tests: {
        projectTotal: getProjectTotal(name, projects),
        instanceTotal: getInstanceTotal(name, projects),
        coverageTotal
      },
      stories: stories.find(s => s.element.startsWith(name))?.stories ?? [],
    };

    metadata.behavior = getBehaviorCategory(manifest);
    metadata.status = getElementStability(metadata);

    return [...elements, metadata];
  }, []).sort((a, b) => a.name < b.name ? -1 : 1);
}

function getBaseInterface() {
  const project = new Project();
  const file = project.addSourceFileAtPath(resolve('src/internal/types/index.ts'));
  const base = file.getChildrenOfKind(SyntaxKind.InterfaceDeclaration).find(i => i.getName() === 'MlvElement');
  const props = base.getStructure().properties.map(n => ({ name: n.name, type: n.type, description: n.docs[0]?.description }));
  return props;
}

async function getMetrics() {
  const projects = await getProjects();
  const coverage = getCoverage();
  const coverageTotal = coverage.splice(coverage.findIndex(c => c.file === 'total'), 1)[0];
  const elements = getElements(coverage, projects);
  const metrics = {
    created: new Date().toISOString(),
    elements,
    tests: {
      coverage,
      coverageTotal
    },
    elements: {
      projects,
      versions: Array.from(new Set(projects.map(p => p.elementsVersion.replace('^', '').replace('~', '')))),
    },
    types: {
      props : getBaseInterface()
    }
  };

  return metrics;
}

const metrics = await getMetrics();

if (!existsSync('./metrics')) {
  mkdirSync('./metrics');
}

writeFileSync('./metrics/data.json', JSON.stringify(metrics, null, 2));
