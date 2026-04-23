import { readFileSync } from 'fs';
import path from 'path';
import * as url from 'url';
// must not use node_modules dependencies, CI skips installation during this reporting call

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const PROJECTS_ROOT = path.resolve(__dirname, '../..');

const PROJECTS = [
  { name: '@nvidia-elements/core', dir: 'core' },
  { name: '@nvidia-elements/code', dir: 'code' },
  { name: '@nvidia-elements/styles', dir: 'styles' },
  { name: '@nvidia-elements/themes', dir: 'themes' },
  { name: '@nvidia-elements/forms', dir: 'forms' },
  { name: '@nvidia-elements/markdown', dir: 'markdown' },
  { name: '@nvidia-elements/media', dir: 'media' },
  { name: '@nvidia-elements/monaco', dir: 'monaco' },
  { name: 'site', dir: 'site' }
];

function tryRead(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

const rows = PROJECTS.map(({ name, dir }) => {
  const tests = tryRead(path.join(PROJECTS_ROOT, dir, 'coverage/lighthouse/summary.json'));
  return { name, tests };
});

const totals = rows.reduce(
  (acc, { tests }) => {
    if (tests) {
      acc.numPassedTests += tests.numPassedTests ?? 0;
      acc.numFailedTests += tests.numFailedTests ?? 0;
      acc.numTotalTests += tests.numTotalTests ?? 0;
    }
    return acc;
  },
  { numPassedTests: 0, numFailedTests: 0, numTotalTests: 0 }
);

const output = [];
output.push('## Lighthouse summary');
output.push('');
output.push('### Tests');
output.push('| Package | Passed | Failed | Total |');
output.push('| --- | ---: | ---: | ---: |');
for (const { name, tests } of rows) {
  if (!tests) {
    output.push(`| ${name} | — | — | — |`);
    continue;
  }
  output.push(`| ${name} | ${tests.numPassedTests} | ${tests.numFailedTests} | ${tests.numTotalTests} |`);
}
output.push(
  `| **Total** | **${totals.numPassedTests}** | **${totals.numFailedTests}** | **${totals.numTotalTests}** |`
);
output.push('');

console.log(output.join('\n'));
