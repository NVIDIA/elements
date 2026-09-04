import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import * as url from 'url';
import { LIGHTHOUSE_PROJECTS } from './lighthouse-projects.js';

// OpenMetrics/Prometheus https://docs.gitlab.com/ee/ci/testing/metrics_reports.html

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resolve = rel => path.resolve(__dirname, rel);
const DIST_DIR = resolve('../../../.metrics');

function getMetrics(scope, lighthouseReport) {
  const report = Object.keys(lighthouseReport).flatMap(testName => {
    const test = lighthouseReport[testName];

    const jsRequests = Object.entries(test.payload.javascript.requests)
      .map(r => r[1])
      .filter(r => r.name.endsWith('.js') && !test.name.includes('.css'))
      .map(r => {
        r.name = test.name.endsWith('.js')
          ? `${scope}/${test.name.replace('nve-', '')}`
          : `${scope}/${test.name.replace('nve-', '')}/${r.name}`;
        r.name = r.name.includes('bundles/index.') ? `${r.name.split('/index.')[0]}.js` : r.name;
        r.name = test.name.includes('nve-') ? r.name.replace('index.js', 'define.js') : r.name;
        return r;
      });

    const cssRequests = Object.entries(test.payload.css.requests)
      .map(r => r[1])
      .filter(r => r.name.endsWith('.css'))
      .map(r => {
        r.name = test.name.endsWith('.css') ? `${scope}/${test.name}` : `${scope}/${test.name}/${r.name}`;
        r.name = r.name.includes('bundles/index.') ? `${r.name.split('/index.')[0]}.css` : r.name;
        return r;
      });

    return [
      ...jsRequests.map(
        request => `bundle_size{entrypoint="${request.name}",type="js",unit="kb"} ${request.kb.toFixed(1)}`
      ),
      ...cssRequests.map(
        request => `bundle_size{entrypoint="${request.name}",type="css",unit="kb"} ${request.kb.toFixed(1)}`
      )
    ];
  });

  return report.join('\n');
}

const projectMetrics = LIGHTHOUSE_PROJECTS.filter(project => project.metrics).map(({ name, dir }) => {
  const report = JSON.parse(readFileSync(resolve(`../../${dir}/.lighthouse/dist/report.json`)));
  return getMetrics(name, report);
});

const metrics = `
# HELP bundle_size Total JavaScript bundle size in kb
# TYPE bundle_size gauge
# UNIT bundle_size kb
${projectMetrics.join('\n')}`;

if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR);
}

writeFileSync(resolve(`${DIST_DIR}/metrics.lighthouse.txt`), metrics);
