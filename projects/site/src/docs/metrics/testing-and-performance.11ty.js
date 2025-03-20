import { ESM_ELEMENTS_VERSION } from '@internals/elements-api';
import { MetadataService } from '@internals/metadata';

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
          <nve-api-badge-coverage value="${metrics['@nvidia-elements/core'].tests.coverageTotal.statements.pct}" container="flat"></nve-api-badge-coverage>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Lines</span>
          <nve-api-badge-coverage value="${metrics['@nvidia-elements/core'].tests.coverageTotal.lines.pct}" container="flat"></nve-api-badge-coverage>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Functions</span>
          <nve-api-badge-coverage value="${metrics['@nvidia-elements/core'].tests.coverageTotal.functions.pct}" container="flat"></nve-api-badge-coverage>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Branches</span>
          <nve-api-badge-coverage value="${metrics['@nvidia-elements/core'].tests.coverageTotal.branches.pct}" container="flat"></nve-api-badge-coverage>
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
          <nve-grid-cell><nve-api-badge-coverage value="${cov.statements.pct}" container="flat"></nve-api-badge-coverage></nve-grid-cell>
          <nve-grid-cell><nve-api-badge-coverage value="${cov.lines.pct}" container="flat"></nve-api-badge-coverage></nve-grid-cell>
          <nve-grid-cell><nve-api-badge-coverage value="${cov.functions.pct}" container="flat"></nve-api-badge-coverage></nve-grid-cell>
          <nve-grid-cell><nve-api-badge-coverage value="${cov.branches.pct}" container="flat"></nve-api-badge-coverage></nve-grid-cell>
        </nve-grid-row>`
          )
          .join('')}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
        </nve-grid-footer>
      </nve-grid>
    </section>
    <nve-grid style="margin-top: 26px; --scroll-height: calc(100vh - 330px)">
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
          <nve-grid-cell><nve-api-badge-lighthouse value='{ "performance": ${element.tests.lighthouse?.scores?.performance} }' container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
          <nve-grid-cell><nve-api-badge-lighthouse value='{ "accessibility": ${element.tests.lighthouse?.scores?.accessibility} }' container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
          <nve-grid-cell><nve-api-badge-lighthouse value='{ "bestPractices": ${element.tests.lighthouse?.scores?.bestPractices} }' container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
          <nve-grid-cell><nve-api-badge-bundle value="${element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2)}" container="flat"></nve-api-badge-bundle></nve-grid-cell>
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
