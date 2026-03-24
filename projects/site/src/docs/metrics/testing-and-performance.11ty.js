// @ts-check

import { TestsService } from '@internals/metadata';
import { badgeCoverage, badgeBundle, badgeLighthouse } from '../../_11ty/templates/api.js';

export const data = {
  title: 'Testing & Performance',
  layout: 'docs.11ty.js'
};

/** @type {import('@internals/metadata').ProjectsTestSummary} */
const tests = await TestsService.getData();

const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(tests.created)
);

export function render() {
  return this.renderTemplate(
    /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <h1 nve-text="heading lg">Testing & Performance</h1>
    <p nve-text="body muted">Report of the testing and performance metrics for the Elements components and APIs.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
    <nve-tabs-item selected><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
  </div>
  <div nve-layout="column gap:md">
    <section nve-layout="column gap:md">
      <div nve-layout="row gap:md align:vertical-center">
        <h3 nve-text="body bold">Coverage:</h3>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Statements</span>
          ${badgeCoverage(tests.projects['@nvidia-elements/core'].coverage.total.statements.pct, 'flat')}
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Lines</span>
          ${badgeCoverage(tests.projects['@nvidia-elements/core'].coverage.total.lines.pct, 'flat')}
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Functions</span>
          ${badgeCoverage(tests.projects['@nvidia-elements/core'].coverage.total.functions.pct, 'flat')}
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Branches</span>
          ${badgeCoverage(tests.projects['@nvidia-elements/core'].coverage.total.branches.pct, 'flat')}
        </section>
      </div>
    </section>
    <section nve-layout="grid gap:md span-items:6">
      <nve-grid style="--scroll-height: calc(100vh - 310px)">
        <nve-grid-header>
          <nve-grid-column width="350px">File</nve-grid-column>
          <nve-grid-column width="180px">Statements</nve-grid-column>
          <nve-grid-column width="180px">Lines</nve-grid-column>
          <nve-grid-column width="180px">Functions</nve-grid-column>
          <nve-grid-column>Branches</nve-grid-column>
        </nve-grid-header>
        ${Object.values(tests.projects)
          .flatMap(project => project.coverage.testResults)
          .map(
            cov => /* html */ `<nve-grid-row>
          <nve-grid-cell><p nve-text="body truncate">${cov.file}</p></nve-grid-cell>
          <nve-grid-cell>${badgeCoverage(cov.statements.pct, 'flat')}</nve-grid-cell>
          <nve-grid-cell>${badgeCoverage(cov.lines.pct, 'flat')}</nve-grid-cell>
          <nve-grid-cell>${badgeCoverage(cov.functions.pct, 'flat')}</nve-grid-cell>
          <nve-grid-cell>${badgeCoverage(cov.branches.pct, 'flat')}</nve-grid-cell>
        </nve-grid-row>`
          )
          .join('')}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
        </nve-grid-footer>
      </nve-grid>
      <nve-grid style="--scroll-height: calc(100vh - 310px)">
        <nve-grid-header>
          <nve-grid-column>Lighthouse Report</nve-grid-column>
          <nve-grid-column>Performance</nve-grid-column>
          <nve-grid-column>Accessibility</nve-grid-column>
          <nve-grid-column>Best Practices</nve-grid-column>
          <nve-grid-column>Bundle Size</nve-grid-column>
        </nve-grid-header>
        ${Object.values(tests.projects)
          .flatMap(project => project.lighthouse.testResults)
          .map(
            report => /* html */ `<nve-grid-row>
            <nve-grid-cell>${report.name}</nve-grid-cell>
            <nve-grid-cell>${badgeLighthouse({ performance: report?.scores.performance }, 'flat')}</nve-grid-cell>
            <nve-grid-cell>${badgeLighthouse({ accessibility: report.scores.accessibility }, 'flat')}</nve-grid-cell>
            <nve-grid-cell>${badgeLighthouse({ bestPractices: report.scores.bestPractices }, 'flat')}</nve-grid-cell>
            <nve-grid-cell>${badgeBundle(report?.payload.javascript.kb ?? 0, 'flat')}</nve-grid-cell>
          </nve-grid-row>`
          )
          .join('')}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <a nve-text="link" href="https://developer.chrome.com/docs/lighthouse/overview/" style="margin-left: auto">Lighthouse</a>
        </nve-grid-footer>
      </nve-grid>
    </section>
  </div>
</div>
  `,
    'html'
  );
}
