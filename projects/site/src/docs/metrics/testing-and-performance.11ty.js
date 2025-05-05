import { ESM_ELEMENTS_VERSION } from '@nve-internals/elements-api';
import { MetadataService } from '@nve-internals/metadata';
import { badgeCoverage, badgeBundle, badgeLighthouse } from '../../_11ty/templates/api.js';

export const data = {
  title: 'Testing & Performance',
  layout: 'docs.11ty.js'
};

const metrics = await MetadataService.getMetadata();
const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(metrics.created)
);

export function render() {
  return this.renderTemplate(
    /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:lg">
    <div nve-layout="row gap:md align:vertical-center">
      <h1 nve-text="heading lg">Elements</h1>
      <nve-badge status="success">version ${ESM_ELEMENTS_VERSION}</nve-badge>
    </div>
    <p nve-text="body muted">Below are metrics measuring various aspects of the Elements system including usage, test coverage and API stability.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/elements/">Maglev</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
  </div>
  <div nve-layout="grid gap:md span-items:6">
    <section nve-layout="column gap:md">
      <div nve-layout="row gap:md align:vertical-center">
        <h3 nve-text="body bold">Test Coverage:</h3>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Statements</span>
          ${badgeCoverage(metrics['@nvidia-elements/core'].tests.coverageTotal.statements.pct, 'flat')}
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Lines</span>
          ${badgeCoverage(metrics['@nvidia-elements/core'].tests.coverageTotal.lines.pct, 'flat')}
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Functions</span>
          ${badgeCoverage(metrics['@nvidia-elements/core'].tests.coverageTotal.functions.pct, 'flat')}
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Branches</span>
          ${badgeCoverage(metrics['@nvidia-elements/core'].tests.coverageTotal.branches.pct, 'flat')}
        </section>
      </div>
      <nve-grid style="--scroll-height: calc(100vh - 330px)">
        <nve-grid-header>
          <nve-grid-column width="350px">File</nve-grid-column>
          <nve-grid-column width="180px">Statements</nve-grid-column>
          <nve-grid-column width="180px">Lines</nve-grid-column>
          <nve-grid-column width="180px">Functions</nve-grid-column>
          <nve-grid-column>Branches</nve-grid-column>
        </nve-grid-header>
        ${metrics['@nvidia-elements/core'].tests.coverage
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
    </section>
    <nve-grid style="margin-top: 44px; --scroll-height: calc(100vh - 330px)">
      <nve-grid-header>
        <nve-grid-column>Lighthouse Report</nve-grid-column>
        <nve-grid-column>Performance</nve-grid-column>
        <nve-grid-column>Accessibility</nve-grid-column>
        <nve-grid-column>Best Practices</nve-grid-column>
        <nve-grid-column>Bundle Size</nve-grid-column>
      </nve-grid-header>
      ${metrics['@nvidia-elements/core'].elements
        .map(
          element => /* html */ `<nve-grid-row>
          <nve-grid-cell>${element.name}</nve-grid-cell>
          <nve-grid-cell>${badgeLighthouse({ performance: element.tests.lighthouse?.scores?.performance }, 'flat')}</nve-grid-cell>
          <nve-grid-cell>${badgeLighthouse({ accessibility: element.tests.lighthouse?.scores?.accessibility }, 'flat')}</nve-grid-cell>
          <nve-grid-cell>${badgeLighthouse({ bestPractices: element.tests.lighthouse?.scores?.bestPractices }, 'flat')}</nve-grid-cell>
          <nve-grid-cell>${badgeBundle(element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2), 'flat')}</nve-grid-cell>
        </nve-grid-row>`
        )
        .join('')}
      <nve-grid-footer>
        <p nve-text="body muted sm">Report Created on ${reportDate}</p>
        <a nve-text="link" href="https://developer.chrome.com/docs/lighthouse/overview/" style="margin-left: auto">Lighthouse</a>
      </nve-grid-footer>
    </nve-grid>
  </div>
</div>
  `,
    'md'
  );
}
