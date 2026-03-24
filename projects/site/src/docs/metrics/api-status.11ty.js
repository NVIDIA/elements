// @ts-check

import { badgeStatus, badgeCoverage, badgeBundle, badgeLighthouse, badgeAxe } from '../../_11ty/templates/api.js';
import { ESM_ELEMENTS_VERSION } from '../../_11ty/utils/version.js';
import { siteData } from '../../index.11tydata.js';

const { tests } = siteData;

export const data = {
  title: 'API Status',
  layout: 'docs.11ty.js'
};

const lighthouseResults = Object.values(tests.projects).flatMap(project => project.lighthouse.testResults);
const ssrResults = Object.values(tests.projects)
  .flatMap(project => project.ssr.testResults)
  .flatMap(results => results.assertionResults);
const axeResults = Object.values(tests.projects)
  .flatMap(project => project.axe.testResults)
  .flatMap(results => results.assertionResults);
const coverageResults = Object.values(tests.projects)
  .flatMap(project => project.coverage.testResults)
  .flatMap(results => results);
const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(tests.created)
);
const elements = siteData.elements
  .filter(element => !element.name.includes('internal') && !element.name.includes('json-viewer'))
  .sort((a, b) => a.name.localeCompare(b.name));

export function render() {
  return this.renderTemplate(
    /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <h1 nve-text="heading lg">API Status</h1>
    <p nve-text="body muted">Metrics measuring various aspects of the Elements components and APIs including, test coverage, performance, accessibility, and API stability.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
  </div>
  <div nve-layout="row gap:md align:vertical-center">
    <h3 nve-text="body bold">Summary:</h3>
    <section nve-layout="row gap:xs align:center">
      <span nve-text="body sm muted">Total Available Web Components</span>
      <nve-badge color="blue-cobalt">
        ${elements.length}
      </nve-badge>
      -
      <span nve-text="body sm muted">Total Available Parent Elements</span>
      <nve-badge color="blue-cobalt">
        ${[...new Set(elements.map(el => el.name.split('-')[1]))].length + 2}
      </nve-badge>
    </section>
  </div>
  <nve-grid style="--scroll-height: calc(100vh - 315px)">
    <nve-grid-header>
      ${Object.entries(columns)
        .map(
          ([name, column]) => /* html */ `<nve-grid-column
        id="${name}"
        width="${column.width ? column.width : '160px'}">
        ${name
          .replace(/([A-Z]+)/g, ' $1')
          .replace(/([A-Z][a-z])/g, ' $1')
          .replace(/^./, match => match.toUpperCase())
          .replace('Ssr', 'SSR')}
      </nve-grid-column>`
        )
        .join('')}
    </nve-grid-header>
    ${elements
      .map(element => {
        const lighthouse = lighthouseResults.find(
          report => report.name === element.name || report.name.includes(element.name.split('-')[1])
        );
        const ssr = ssrResults.find(
          result => result.fullName === element.name || result.fullName.includes(element.name.split('-')[1])
        );
        const axe = axeResults.find(
          result => result.fullName === element.name || result.fullName.includes(element.name.split('-')[1])
        );
        const coverageTotal =
          coverageResults.find(
            result => result.file === element.name || result.file?.includes(element.name.split('-')[1])
          )?.branches.pct ?? 0;
        return /* html */ `<nve-grid-row>
        <nve-grid-cell>${element.name.replace('nve-', '')}</nve-grid-cell>
        <nve-grid-cell>${badgeStatus(element?.manifest?.metadata?.status ?? '', 'flat', ESM_ELEMENTS_VERSION)}</nve-grid-cell>
        <nve-grid-cell>${badgeCoverage(coverageTotal, 'flat')}</nve-grid-cell>
        <nve-grid-cell>${lighthouse?.payload?.javascript?.kb ? /* html */ badgeBundle(lighthouse?.payload?.javascript?.kb, 'flat') : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell>${lighthouse?.scores?.performance ? /* html */ badgeLighthouse({ performance: lighthouse?.scores?.performance }, 'flat') : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell>${lighthouse?.scores?.accessibility ? /* html */ badgeLighthouse({ accessibility: lighthouse?.scores?.accessibility }, 'flat') : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell>${lighthouse?.scores?.bestPractices ? /* html */ badgeLighthouse({ bestPractices: lighthouse?.scores?.bestPractices }, 'flat') : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell><nve-badge container="flat" status="${ssr?.status === 'passed' ? 'success' : 'warning'}">${ssr?.status ?? 'unknown'}</nve-badge></nve-grid-cell>
        <nve-grid-cell>${badgeAxe(axe?.failureMessages[0] ?? '', 'flat')}</nve-grid-cell>
        <nve-grid-cell>${getBehaviorCategoryIcon(element.manifest?.metadata?.behavior ?? 'unknown')}&nbsp;&nbsp;<a href=${element.manifest?.metadata?.aria ?? ''} nve-text="link no-visit">${element.manifest?.metadata?.behavior ?? 'unknown'}</a></nve-grid-cell>
        <nve-grid-cell>${element.manifest?.metadata?.since ?? ''}</nve-grid-cell>
        <nve-grid-cell><nve-badge status="success" container="flat">light/dark</nve-badge></nve-grid-cell>
        <nve-grid-cell>${element.manifest?.metadata?.responsive ? /* html */ `<nve-badge status="success" container="flat">layouts</nve-badge>` : /* html */ `<nve-badge status="warning" container="flat">partial</nve-badge>`}</nve-grid-cell>
      </nve-grid-row>`;
      })
      .join('')}
    <nve-grid-footer>
      <p nve-text="body muted sm">Report Created on ${reportDate}</p>
    </nve-grid-footer>
  </nve-grid>
  ${Object.entries(columns)
    .map(([name, column]) => /* html */ `<nve-tooltip id="tooltip-${name}" hidden>${column.tooltip}</nve-tooltip>`)
    .join('')}
</div >
    `,
    'md'
  );
}

const columns = {
  element: { width: '200px', tooltip: 'Custom Element API' },
  status: { width: '130px', tooltip: 'Element Stability Status' },
  coverage: { width: '130px', tooltip: 'Unit Test Coverage' },
  bundle: { width: '130px', tooltip: 'Standalone total JavaScript bundle size in kb' },
  performance: { width: '130px', tooltip: 'Chrome Lighthouse Performance Score' },
  accessibility: { width: '130px', tooltip: 'Chrome Lighthouse Accessibility Score' },
  bestPractices: { width: '130px', tooltip: 'Chrome Lighthouse Best Practices Score' },
  ssr: { width: '130px', tooltip: 'Support Basic Server Side Rendering (SSR)' },
  axe: { width: '170px', tooltip: 'Accessibility status from Axe Core API' },
  spec: { tooltip: 'Behavior category from W3C and WAI-ARIA Specification', width: '170px' },
  released: { tooltip: 'Version Element was first released', width: '170px' },
  themes: { width: '170px', tooltip: 'Supports base light and dark theme' },
  responsive: { tooltip: 'Provides basic minimal resposive layouts' }
};

function getBehaviorCategoryIcon(category) {
  return {
    ['navigation']: '🧭',
    ['content']: '🖥️',
    ['list']: '📃',
    ['form']: '🖋️',
    ['feedback']: '💡',
    ['popover']: '💬',
    ['container']: '📦',
    ['button']: '🆗'
  }[category];
}
