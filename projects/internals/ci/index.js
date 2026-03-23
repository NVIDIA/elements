import { readFileSync } from 'fs';
import path from 'path';
import * as url from 'url';
// must not use node_modules dependencies, CI skips installation during this reporting call

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resolve = rel => path.resolve(__dirname, rel);

const elementsCoverage = JSON.parse(readFileSync(resolve('../../core/coverage/unit/coverage-summary.json')));
const labsCodeCoverage = JSON.parse(readFileSync(resolve('../../code/coverage/unit/coverage-summary.json')));
const monacoCoverage = JSON.parse(readFileSync(resolve('../../monaco/coverage/unit/coverage-summary.json')));
const labsFormsCoverage = JSON.parse(readFileSync(resolve('../../forms/coverage/unit/coverage-summary.json')));
const labsCliCoverage = JSON.parse(readFileSync(resolve('../../cli/coverage/unit/coverage-summary.json')));
const labsLintCoverage = JSON.parse(readFileSync(resolve('../../lint/coverage/unit/coverage-summary.json')));
const labsMarkdownCoverage = JSON.parse(readFileSync(resolve('../../markdown/coverage/unit/coverage-summary.json')));
const labsMediaCoverage = JSON.parse(readFileSync(resolve('../../media/coverage/unit/coverage-summary.json')));
const internalsMetadataCoverage = JSON.parse(readFileSync(resolve('../metadata/coverage/unit/coverage-summary.json')));
const internalsToolsCoverage = JSON.parse(readFileSync(resolve('../tools/coverage/unit/coverage-summary.json')));

const report = [
  elementsCoverage,
  labsCodeCoverage,
  labsFormsCoverage,
  labsCliCoverage,
  labsLintCoverage,
  labsMarkdownCoverage,
  labsMediaCoverage,
  monacoCoverage,
  internalsMetadataCoverage,
  internalsToolsCoverage
]
  .map(r => r.total)
  .reduce(
    (all, report) => {
      return {
        lines: {
          total: all.lines.total + report.lines.total,
          covered: all.lines.covered + report.lines.covered,
          pct: (all.lines.covered + report.lines.covered) / (all.lines.total + report.lines.total)
        },
        statements: {
          total: all.statements.total + report.statements.total,
          covered: all.statements.covered + report.statements.covered,
          pct: (all.statements.covered + report.statements.covered) / (all.statements.total + report.statements.total)
        },
        functions: {
          total: all.functions.total + report.functions.total,
          covered: all.functions.covered + report.functions.covered,
          pct: (all.functions.covered + report.functions.covered) / (all.functions.total + report.functions.total)
        },
        branches: {
          total: all.branches.total + report.branches.total,
          covered: all.branches.covered + report.branches.covered,
          pct: (all.branches.covered + report.branches.covered) / (all.branches.total + report.branches.total)
        }
      };
    },
    {
      lines: {
        total: 0,
        covered: 0,
        pct: 0
      },
      statements: {
        total: 0,
        covered: 0,
        pct: 0
      },
      functions: {
        total: 0,
        covered: 0,
        pct: 0
      },
      branches: {
        total: 0,
        covered: 0,
        pct: 0
      }
    }
  );

console.log(`Report:\n`, report, '\n');
console.log(`@nvidia-elements/core coverage: ${elementsCoverage.total.branches.pct}%`);
console.log(`@nvidia-elements/monaco coverage: ${monacoCoverage.total.branches.pct}%`);
console.log(`@nvidia-elements/cli coverage: ${labsCliCoverage.total.branches.pct}%`);
console.log(`@nvidia-elements/code coverage: ${labsCodeCoverage.total.branches.pct}%`);
console.log(`@nvidia-elements/forms coverage: ${labsFormsCoverage.total.branches.pct}%`);
console.log(`@nvidia-elements/lint coverage: ${labsLintCoverage.total.branches.pct}%`);
console.log(`@nvidia-elements/markdown coverage: ${labsMarkdownCoverage.total.branches.pct}%`);
console.log(`@internals/metadata coverage: ${internalsMetadataCoverage.total.branches.pct}%`);
console.log(`@internals/tools coverage: ${internalsToolsCoverage.total.branches.pct}%`);
console.log(`average coverage: ${((report.branches.covered / report.branches.total) * 100).toFixed(2)}%`);
