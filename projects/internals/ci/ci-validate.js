import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf-8');
const requiredTools = ['node', 'pnpm', 'vale', 'go', 'git-lfs'];
const packageJson = JSON.parse(read('package.json'));
const toolsTable = read('mise.toml').match(/^\[tools]\n([\s\S]*?)(?=^\[|(?![\s\S]))/m)?.[1] ?? '';
const tools = Object.fromEntries(
  [...toolsTable.matchAll(/^\s*"?([\w-]+)"?\s*=\s*"([^"]+)"/gm)].map(([, key, value]) => [key, value])
);

const expectations = [
  ['mise node', tools.node, read('.nvmrc').trim(), '.nvmrc'],
  ['package engines.node', packageJson.engines.node, tools.node, 'mise node'],
  ['packageManager pnpm', packageJson.packageManager.match(/^pnpm@(.+)$/)?.[1], tools.pnpm, 'mise pnpm'],
  ['devEngines.packageManager.version', packageJson.devEngines.packageManager.version, tools.pnpm, 'mise pnpm']
];

const failures = [
  ...requiredTools.filter(tool => !tools[tool]).map(tool => `mise.toml missing [tools].${tool}`),
  ...expectations
    .filter(([, actual, expected]) => actual !== expected)
    .map(
      ([label, actual, expected, expectedLabel]) =>
        `${label} is ${actual ?? 'undefined'} but ${expectedLabel} is ${expected ?? 'undefined'}`
    )
];

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
