import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import * as url from 'url';

// OpenMetrics/Prometheus https://docs.gitlab.com/ee/ci/testing/metrics_reports.html

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resolve = rel => path.resolve(__dirname, rel);
const DIST_DIR = resolve('../../../.metrics');

const elementsLighthouse = JSON.parse(readFileSync(resolve('../../core/.lighthouse/dist/report.json')));
const themesLighthouse = JSON.parse(readFileSync(resolve('../../themes/.lighthouse/dist/report.json')));
const stylesLighthouse = JSON.parse(readFileSync(resolve('../../styles/.lighthouse/dist/report.json')));
const monacoLighthouse = JSON.parse(readFileSync(resolve('../../monaco/.lighthouse/dist/report.json')));
const labsCodeLighthouse = JSON.parse(readFileSync(resolve('../../code/.lighthouse/dist/report.json')));
const labsFormsLighthouse = JSON.parse(readFileSync(resolve('../../forms/.lighthouse/dist/report.json')));
const labsMarkdownLighthouse = JSON.parse(readFileSync(resolve('../../markdown/.lighthouse/dist/report.json')));
const labsMediaLighthouse = JSON.parse(readFileSync(resolve('../../media/.lighthouse/dist/report.json')));

const elementsMetrics = getMetrics('@nvidia-elements/core', elementsLighthouse);
const themesMetrics = getMetrics('@nvidia-elements/themes', themesLighthouse);
const stylesMetrics = getMetrics('@nvidia-elements/styles', stylesLighthouse);
const monacoMetrics = getMetrics('@nvidia-elements/monaco', monacoLighthouse);
const labsCodeMetrics = getMetrics('@nvidia-elements/code', labsCodeLighthouse);
const labsFormsMetrics = getMetrics('@nvidia-elements/forms', labsFormsLighthouse);
const labsMarkdownMetrics = getMetrics('@nvidia-elements/markdown', labsMarkdownLighthouse);
const labsMediaMetrics = getMetrics('@nvidia-elements/media', labsMediaLighthouse);

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

const metrics = `
# HELP bundle_size Total JavaScript bundle size in kb
# TYPE bundle_size gauge
# UNIT bundle_size kb
${elementsMetrics}
${themesMetrics}
${stylesMetrics}
${monacoMetrics}
${labsCodeMetrics}
${labsFormsMetrics}
${labsMarkdownMetrics}
${labsMediaMetrics}`;

if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR);
}

writeFileSync(resolve(`${DIST_DIR}/metrics.lighthouse.txt`), metrics);
