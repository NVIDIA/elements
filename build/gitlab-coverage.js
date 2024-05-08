import { readFileSync } from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resolve = rel => path.resolve(__dirname, rel);

const elementsCoverage = JSON.parse(readFileSync(resolve('../projects/elements/coverage/unit/coverage-summary.json')));
const elementsReactCoverage = JSON.parse(
  readFileSync(resolve('../projects/elements-react/coverage/unit/coverage-summary.json'))
);

const report = [elementsCoverage, elementsReactCoverage]
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
console.log(`Elements Coverage: ${elementsCoverage.total.branches.pct}%`);
console.log(`Elements React Coverage: ${elementsReactCoverage.total.branches.pct}%`);
console.log(`Average Coverage: ${((report.branches.covered / report.branches.total) * 100).toFixed(2)}%`);
