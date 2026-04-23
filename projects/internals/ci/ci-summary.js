import { readFileSync } from 'fs';
import path from 'path';
import * as url from 'url';
// must not use node_modules dependencies, CI skips installation during this reporting call

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const PROJECTS_ROOT = path.resolve(__dirname, '../..');

const PROJECTS = [
  { name: '@nvidia-elements/core', dir: 'core' },
  { name: '@nvidia-elements/code', dir: 'code' },
  { name: '@nvidia-elements/cli', dir: 'cli' },
  { name: '@nvidia-elements/forms', dir: 'forms' },
  { name: '@nvidia-elements/lint', dir: 'lint' },
  { name: '@nvidia-elements/markdown', dir: 'markdown' },
  { name: '@nvidia-elements/media', dir: 'media' },
  { name: '@nvidia-elements/monaco', dir: 'monaco' },
  { name: '@internals/metadata', dir: 'internals/metadata' },
  { name: '@internals/tools', dir: 'internals/tools' }
];

function tryRead(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function fmtPct(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : '—';
}

function pctOf(covered, total) {
  return total > 0 ? (covered / total) * 100 : NaN;
}

const rows = PROJECTS.map(({ name, dir }) => {
  const base = path.join(PROJECTS_ROOT, dir, 'coverage/unit');
  const coverage = tryRead(path.join(base, 'coverage-summary.json'));
  const tests = tryRead(path.join(base, 'summary.json'));
  return { name, coverage: coverage?.total ?? null, tests };
});

const totals = rows.reduce(
  (acc, { coverage, tests }) => {
    if (coverage) {
      for (const key of ['lines', 'statements', 'functions', 'branches']) {
        acc.coverage[key].total += coverage[key].total;
        acc.coverage[key].covered += coverage[key].covered;
      }
    }
    if (tests) {
      acc.tests.numPassedTests += tests.numPassedTests ?? 0;
      acc.tests.numFailedTests += tests.numFailedTests ?? 0;
      acc.tests.numTotalTests += tests.numTotalTests ?? 0;
    }
    return acc;
  },
  {
    coverage: {
      lines: { total: 0, covered: 0 },
      statements: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 }
    },
    tests: { numPassedTests: 0, numFailedTests: 0, numTotalTests: 0 }
  }
);

const output = [];
output.push('## CI summary');
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
  `| **Total** | **${totals.tests.numPassedTests}** | **${totals.tests.numFailedTests}** | **${totals.tests.numTotalTests}** |`
);
output.push('');
output.push('### Coverage');
output.push('| Package | Lines | Statements | Functions | Branches |');
output.push('| --- | ---: | ---: | ---: | ---: |');
for (const { name, coverage } of rows) {
  if (!coverage) {
    output.push(`| ${name} | — | — | — | — |`);
    continue;
  }
  output.push(
    `| ${name} | ${fmtPct(coverage.lines.pct)} | ${fmtPct(coverage.statements.pct)} | ${fmtPct(coverage.functions.pct)} | ${fmtPct(coverage.branches.pct)} |`
  );
}
output.push(
  `| **Total** | **${fmtPct(pctOf(totals.coverage.lines.covered, totals.coverage.lines.total))}** | **${fmtPct(pctOf(totals.coverage.statements.covered, totals.coverage.statements.total))}** | **${fmtPct(pctOf(totals.coverage.functions.covered, totals.coverage.functions.total))}** | **${fmtPct(pctOf(totals.coverage.branches.covered, totals.coverage.branches.total))}** |`
);
output.push('');

console.log(output.join('\n'));
