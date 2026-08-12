#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const GENERATED_REFERENCE_PATHS = ['.eslintcache', '.visual/', '.wireit/', 'coverage/', 'dist/', 'node_modules/'];

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printUsage();
  process.exit(0);
}

const name = options.name;
const referenceName = options.reference ?? 'plot';
const description = options.description ?? `A ${name} component.`;

assertKebabCase(name, '--name');
assertKebabCase(referenceName, '--reference');
if (description.includes('\n')) fail('--description must be a single line.');
if (description.includes('*/')) fail('--description must not contain "*/".');

const root = findRepositoryRoot(options.root ?? process.cwd());
const projectRelative = `projects/${name}`;
const projectDirectory = path.join(root, projectRelative);
const referenceRelative = `projects/${referenceName}`;
const referenceDirectory = path.join(root, referenceRelative);

if (existsSync(projectDirectory)) fail(`${projectRelative} already exists.`);
if (!existsSync(referenceDirectory)) fail(`${referenceRelative} does not exist.`);
if (!existsSync(path.join(referenceDirectory, 'src', referenceName, `${referenceName}.ts`))) {
  fail(`${referenceRelative} is not a single-component project named ${referenceName}.`);
}

const className = toPascalCase(name);
const referenceClassName = toPascalCase(referenceName);
const planned = new Map();

copyReferenceProject();
normalizeProjectFiles();
wireRepositoryConsumers();
createDocumentationPage();

const changes = [...planned.entries()]
  .filter(([absolutePath, content]) => {
    if (!existsSync(absolutePath)) return true;
    return readFileSync(absolutePath, 'utf8') !== content;
  })
  .sort(([a], [b]) => a.localeCompare(b));

if (changes.length === 0) fail('The scaffold produced no changes.');

for (const [absolutePath] of changes) {
  const action = existsSync(absolutePath) ? 'update' : 'create';
  console.log(`${options.dryRun ? 'would ' : ''}${action} ${path.relative(root, absolutePath)}`);
}

if (options.dryRun) {
  console.log(`\nDry run complete: ${changes.length} files would change.`);
  process.exit(0);
}

applyChanges(changes);
console.log(`\nCreated ${projectRelative} and wired ${changes.length} files.`);
console.log(
  'Next: run pnpm install, format:fix, notice, project CI, project Lighthouse, metadata generation, site build, and lint:knip through mise.'
);

function parseArgs(args) {
  const parsed = { dryRun: false, help: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }
    if (argument === '--help' || argument === '-h') {
      parsed.help = true;
      continue;
    }
    if (!['--name', '--reference', '--description', '--root'].includes(argument)) {
      fail(`Unknown argument: ${argument}`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for ${argument}.`);
    parsed[argument.slice(2)] = value;
    index += 1;
  }

  if (!parsed.help && !parsed.name) fail('--name is required.');
  return parsed;
}

function printUsage() {
  console.log(`Usage:
  scaffold-project.mjs --name <kebab-case> [options]

Options:
  --description <text>    Package and component description
  --reference <name>      Existing single-component project (default: plot)
  --root <path>           Repository root (default: discover from cwd)
  --dry-run               Print planned changes without writing
  --help                   Show this help`);
}

function assertKebabCase(value, option) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)) {
    fail(`${option} must use kebab-case.`);
  }
}

function findRepositoryRoot(start) {
  let current = path.resolve(start);
  while (true) {
    if (existsSync(path.join(current, 'pnpm-workspace.yaml')) && existsSync(path.join(current, 'projects', 'core'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) fail('Could not find the Elements repository root.');
    current = parent;
  }
}

function copyReferenceProject() {
  const tracked = execFileSync('git', ['-C', root, 'ls-files', '--', referenceRelative], {
    encoding: 'utf8'
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  if (tracked.length === 0) fail(`Git has no tracked files under ${referenceRelative}.`);

  for (const sourceRelative of tracked) {
    const withinReference = path.relative(referenceRelative, sourceRelative);
    if (GENERATED_REFERENCE_PATHS.some(prefix => withinReference === prefix || withinReference.startsWith(prefix))) {
      continue;
    }

    const source = path.join(root, sourceRelative);
    const destinationWithinProject = replaceTokens(withinReference);
    const destination = path.join(projectDirectory, destinationWithinProject);
    const content = readFileSync(source, 'utf8');
    planned.set(destination, replaceTokens(content));
  }
}

function normalizeProjectFiles() {
  updatePlannedJson(`${projectRelative}/package.json`, packageJson => {
    packageJson.name = `@nvidia-elements/${name}`;
    packageJson.description = description;
    packageJson.private = true;
    packageJson.devDependencies = sortObject(packageJson.devDependencies);

    const lint = packageJson.wireit?.lint;
    if (!lint) fail('Reference package is missing wireit.lint.');
    lint.dependencies = ['lint:eslint', 'lint:style'];

    const styleLint = packageJson.wireit?.['lint:style'];
    if (!styleLint) fail('Reference package is missing wireit lint:style.');
    styleLint.command = styleLint.command.replaceAll('../../../stylelint.config.mjs', '../../stylelint.config.mjs');
    styleLint.files = styleLint.files.map(file =>
      file.replaceAll('../../../stylelint.config.mjs', '../../stylelint.config.mjs')
    );
  });

  const componentPath = `${projectRelative}/src/${name}/${name}.ts`;
  let component = getPlannedText(componentPath);
  component = component.replace(/ \* @description .*$/m, ` * @description ${sentence(description)}`);
  component = component.replace(
    / \* @documentation .*$/m,
    ` * @documentation https://nvidia.github.io/elements/docs/${name}/`
  );
  component = component.replace(/ \* @since .*$/m, ' * @since 0.0.0');
  component = component.replace(/^ \* @aria .*\n/m, '');
  planText(componentPath, component);

  planText(`${projectRelative}/README.md`, `# @nvidia-elements/${name}\n\n${sentence(description)}\n`);

  planText(
    `${projectRelative}/DEVELOPMENT.md`,
    `# Development

| Command                    | Description                               |
| -------------------------- | ----------------------------------------- |
| \`pnpm run build\`           | Build the library                         |
| \`pnpm run dev\`             | Start development mode with file watching |
| \`pnpm run lint\`            | Lint source files                         |
| \`pnpm run test\`            | Run unit tests                            |
| \`pnpm run test:watch\`      | Run unit tests in watch mode              |
| \`pnpm run test:axe\`        | Run accessibility tests                   |
| \`pnpm run test:coverage\`   | Run unit tests with coverage              |
| \`pnpm run test:visual\`     | Run visual regression tests               |
| \`pnpm run test:ssr\`        | Run server-side rendering tests           |
| \`pnpm run test:lighthouse\` | Run Lighthouse performance tests          |
| \`pnpm run ci\`              | Run the project CI pipeline                |
`
  );
}

function wireRepositoryConsumers() {
  updateExistingJson('package.json', packageJson => {
    addBefore(
      packageJson.wireit.ci.dependencies,
      `./projects/${name}:ci`,
      dependency => dependency === './projects/site:ci'
    );
    addBefore(
      packageJson.wireit.lighthouse.dependencies,
      `./projects/${name}:test:lighthouse`,
      dependency => dependency === './projects/site:test:lighthouse'
    );
    addBefore(
      packageJson.wireit['lint:fix'].dependencies,
      `./projects/${name}:lint:fix`,
      dependency => dependency === './projects/site:lint:fix'
    );
  });

  let workspace = readExistingText('pnpm-workspace.yaml');
  const workspaceEntry = `  - projects/${name}\n`;
  if (workspace.includes(workspaceEntry)) fail(`${projectRelative} is already in pnpm-workspace.yaml.`);
  const workspaceMarker = '  - projects/styles\n';
  if (!workspace.includes(workspaceMarker)) fail('Could not find the projects/styles workspace marker.');
  workspace = workspace.replace(workspaceMarker, workspaceEntry + workspaceMarker);
  planText('pnpm-workspace.yaml', workspace);

  updateKnipConfig();
  updateMetadataProjects();

  updateExistingJson('projects/internals/metadata/package.json', packageJson => {
    const task = packageJson.wireit?.['generate:api'];
    if (!task) fail('Metadata package is missing generate:api.');
    addBefore(task.files, `../../${name}/package.json`, file => file === '../../patterns/package.json');
    addBefore(task.files, `../../${name}/dist/custom-elements.json`, file => file === '../../patterns/package.json');
    addUnique(task.dependencies, { script: `../../${name}:build`, cascade: false }, dependency => dependency.script);
  });

  updateExistingJson('projects/site/package.json', packageJson => {
    const task = packageJson.wireit?.['build:dependencies'];
    if (!task) fail('Site package is missing build:dependencies.');
    addBefore(task.files, `../${name}/dist/**/*.js`, file => file.startsWith('../internals/'));
    addBefore(task.files, `../${name}/dist/**/*.examples.json`, file => file.startsWith('../internals/'));
    addUnique(task.dependencies, { script: `../${name}:build`, cascade: false }, dependency => dependency.script);
    packageJson.devDependencies[`@nvidia-elements/${name}`] = 'workspace:*';
    packageJson.devDependencies = sortObject(packageJson.devDependencies);
  });
}

function updateKnipConfig() {
  let config = readExistingText('knip.config.js');
  const workspaceMarker = `    'projects/${name}': {`;
  if (config.includes(workspaceMarker)) fail(`${projectRelative} is already in knip.config.js.`);

  const projectBlock = `    'projects/${name}': {
      entry: [
        ...PACKAGE_FILES,
        ...SOURCE_INDEX,
        ...DEFINE_ENTRIES,
        ...EXAMPLE_ENTRIES,
        ...TEST_ENTRIES,
        ...TEST_VARIANT_ENTRIES,
        ...VITE_CONFIGS,
        ...VITEST_CONFIGS
      ],
      project: [...PROJECT_FILES, ...SOURCE_FILES]
    },
`;
  const siteMarker = "    'projects/site': {";
  if (!config.includes(siteMarker)) fail('Could not find the projects/site Knip workspace.');
  config = config.replace(siteMarker, projectBlock + siteMarker);

  const siteStart = config.indexOf(siteMarker);
  const siteEnd = config.indexOf("\n    },\n    'projects/", siteStart);
  if (siteEnd === -1) fail('Could not isolate the projects/site Knip workspace.');
  let siteBlock = config.slice(siteStart, siteEnd + '\n    },'.length);
  const packageName = `@nvidia-elements/${name}`;

  if (/ignoreDependencies: \[[^\]]*\]/s.test(siteBlock)) {
    siteBlock = siteBlock.replace(/ignoreDependencies: \[([^\]]*)\]/s, (_match, values) => {
      const dependencies = [...values.matchAll(/'([^']+)'/g)].map(match => match[1]);
      if (!dependencies.includes(packageName)) dependencies.push(packageName);
      dependencies.sort();
      return `ignoreDependencies: [${dependencies.map(value => `'${value}'`).join(', ')}]`;
    });
  } else {
    siteBlock = siteBlock.replace(
      /(      project: \[[^\n]+\])(\n)/,
      `$1,\n      ignoreDependencies: ['${packageName}']$2`
    );
  }

  siteBlock = siteBlock.replace(/(ignoreDependencies: \[[^\]]*\])\s*\/\/ temporary/, '$1');

  config = config.slice(0, siteStart) + siteBlock + config.slice(siteEnd + '\n    },'.length);
  planText('knip.config.js', config);
}

function updateMetadataProjects() {
  const relative = 'projects/internals/metadata/src/tasks/api.utils.ts';
  let source = readExistingText(relative);
  const match = source.match(/  const projects = \[\n([\s\S]*?)\n  \];/);
  if (!match) fail('Could not find the metadata API project list.');
  const entry = `    '../../../../${name}'`;
  if (match[1].includes(entry)) fail(`${name} is already in the metadata API project list.`);
  const lines = match[1].split('\n');
  lines[lines.length - 1] = `${lines.at(-1)},`;
  lines.push(entry);
  source = source.replace(match[0], `  const projects = [\n${lines.join('\n')}\n  ];`);
  planText(relative, source);
}

function createDocumentationPage() {
  const relative = `projects/site/src/docs/${name}/index.md`;
  if (existsSync(path.join(root, relative))) fail(`${relative} already exists.`);
  planText(
    relative,
    `---
{
  "title": "${className}",
  "description": ${JSON.stringify(description)},
  "layout": "docs.11ty.js",
  "tag": "nve-${name}"
}
---
`
  );
}

function updateExistingJson(relative, mutate) {
  const value = JSON.parse(readExistingText(relative));
  mutate(value);
  planText(relative, `${JSON.stringify(value, null, 2)}\n`);
}

function updatePlannedJson(relative, mutate) {
  const value = JSON.parse(getPlannedText(relative));
  mutate(value);
  planText(relative, `${JSON.stringify(value, null, 2)}\n`);
}

function getPlannedText(relative) {
  const absolute = path.join(root, relative);
  if (!planned.has(absolute)) fail(`No planned file found at ${relative}.`);
  return planned.get(absolute);
}

function readExistingText(relative) {
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) fail(`Required file does not exist: ${relative}.`);
  return readFileSync(absolute, 'utf8');
}

function planText(relative, content) {
  planned.set(path.join(root, relative), content);
}

function addBefore(array, value, predicate) {
  if (array.some(item => JSON.stringify(item) === JSON.stringify(value))) return;
  const index = array.findIndex(predicate);
  if (index === -1) array.push(value);
  else array.splice(index, 0, value);
}

function addUnique(array, value, key) {
  const valueKey = key(value);
  if (!array.some(item => key(item) === valueKey)) array.push(value);
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

function replaceTokens(value) {
  return value.replaceAll(referenceClassName, className).replaceAll(referenceName, name);
}

function sentence(value) {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function toPascalCase(value) {
  return value
    .split('-')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function applyChanges(changesToApply) {
  const originals = new Map();
  for (const [absolutePath] of changesToApply) {
    if (existsSync(absolutePath)) originals.set(absolutePath, readFileSync(absolutePath, 'utf8'));
  }

  try {
    for (const [absolutePath, content] of changesToApply) {
      mkdirSync(path.dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, content, 'utf8');
    }
  } catch (error) {
    for (const [absolutePath, content] of originals) writeFileSync(absolutePath, content, 'utf8');
    for (const [absolutePath] of changesToApply) {
      if (!originals.has(absolutePath)) rmSync(absolutePath, { recursive: true, force: true });
    }
    rmSync(projectDirectory, { recursive: true, force: true });
    throw error;
  }
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}
