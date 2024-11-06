import { createRequire } from 'module';
import { resolve } from 'node:path';
import { writeFileSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

const require = createRequire(import.meta.url);

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
    if (
      (file.endsWith('.ts') ||
        file.endsWith('.js') ||
        file.endsWith('.html') ||
        file.endsWith('.md') ||
        file.endsWith('.mdx')) &&
      !file.includes('.wireit') &&
      !file.includes('dist') &&
      !file.includes('node_modules') &&
      !file.endsWith('.d.ts')
    ) {
      files.push(file);
    }
  }
  return files;
}

function getManifest() {
  const elementsSchemaJSON = JSON.parse(
    readFileSync(new URL('../../../elements/dist/custom-elements.json', import.meta.url))
  );
  return Array.from(
    new Set(
      elementsSchemaJSON.modules.flatMap(module => {
        module.declarations.forEach(d => (d.path = module.path));
        return module.declarations;
      })
    )
  );
}

function getElementsVersion(data) {
  const dependencies =
    data?.dependencies && (data?.dependencies[`@nvidia-elements/core`] || data?.dependencies[`@elements/elements`]);
  const devDependencies =
    data?.devDependencies && (data?.devDependencies[`@nvidia-elements/core`] || data?.devDependencies[`@elements/elements`]);
  const peerDependencies =
    data?.peerDependencies && (data?.peerDependencies[`@nvidia-elements/core`] || data?.peerDependencies[`@elements/elements`]);
  return dependencies || devDependencies || peerDependencies;
}

async function getProjects() {
  const elementTags = getManifest().map(d => d.tagName);
  const path = '../../../../elements';

  return Promise.all(
    (await getPackageFiles(path))
      .filter(path => !path.includes('dist') && !path.includes('deprecated'))
      .reduce((files, path) => {
        const data = require(path);
        return getElementsVersion(data) ? [...files, { ...data, path }] : files;
      }, [])
      .map(file => {
        return {
          package: file.name ? file.name : file.path.split('/src/ui/')[1].replace('/package.json', ''),
          elements: getElementsVersion(file),
          path: file.path.replace('/package.json', '')
        };
      })
      .map(async project => {
        const sources = await getSourceFiles(project.path);
        const elements = Object.entries(
          sources.reduce((tags, path) => {
            const src = readFileSync(path, 'utf8');
            elementTags
              .filter(tag => (tag && src.includes(tag)) || src.includes(tag?.replace('nve-', 'nve-')))
              .forEach(tag => {
                tags[tag] = tags[tag] ? tags[tag] + 1 : 1;
              });
            return tags;
          }, {})
        )
          .map(([name, instanceTotal]) => ({ name, instanceTotal }))
          .filter(e => e.name !== 'undefined');

        return {
          name: project.package,
          path: `src/ui/${project.path.split('/src/ui/')[1]}`,
          elementsVersion: project.elements,
          elements,
          instanceTotal: elements.reduce((p, e) => e.instanceTotal + p, 0)
        };
      })
  );
}

const projects = await getProjects();
const created = new Date().toISOString();

writeFileSync('./dist/elements.json', JSON.stringify({ created, projects }, null, 2));
