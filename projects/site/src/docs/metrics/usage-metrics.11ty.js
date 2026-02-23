// @ts-check

import { UsageService } from '@internals/metadata';
import { compareVersions } from 'compare-versions';

export const data = {
  title: 'Usage Metrics',
  layout: 'docs.11ty.js'
};

const metricsUsage = await UsageService.getData();
const elementReferenceTotal = metricsUsage.projects.reduce((p, n) => p + n.elementReferenceTotal, 0);
const attributeReferenceTotal = metricsUsage.projects.reduce((p, n) => p + n.attributeReferenceTotal, 0);
const importReferenceTotal = metricsUsage.projects.reduce((p, n) => p + n.importReferenceTotal, 0);
const styleReferenceTotal = metricsUsage.projects.reduce((p, n) => p + n.styleReferenceTotal, 0);
const referenceTotal = metricsUsage.projects.reduce((p, n) => p + n.referenceTotal, 0);

export function render() {
  return this.renderTemplate(
    /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <h1 nve-text="heading lg">Usage Metrics</h1>
    <p nve-text="body muted">Metrics and usage metrics for the Elements components and APIs including, total projects, total element template references, total import source references, and additional information.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/usage-metrics/">Usage &amp; Adoption</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <div nve-layout="row gap:md align:vertical-center">
      <section nve-layout="row gap:xs align:center">
        <nve-badge status="queued">Projects: ${metricsUsage.projects.length}</nve-badge>
        <nve-badge status="queued">API References: ${referenceTotal.toLocaleString()}</nve-badge>
        <nve-badge status="pending">Element References: ${elementReferenceTotal.toLocaleString()}</nve-badge>
        <nve-badge status="pending">Attribute References: ${attributeReferenceTotal.toLocaleString()}</nve-badge>
        <nve-badge status="pending">Import References: ${importReferenceTotal.toLocaleString()}</nve-badge>
        <nve-badge status="pending">Style References: ${styleReferenceTotal.toLocaleString()}</nve-badge>
      </section>
      <nve-icon-button popovertarget="additional-information-dialog" icon-name="information-circle-stroke" container="flat" aria-label="additional information"></nve-icon-button>
    </div>
    <nve-grid style="--scroll-height: calc(100vh - 310px)">
      <nve-grid-header>
        <nve-grid-column name="Project" width="300px">Project</nve-grid-column>
        <nve-grid-column name="Repo" width="150px">Repo</nve-grid-column>
        <nve-grid-column name="Source" width="450px">Path</nve-grid-column>
        <nve-grid-column name="Version" width="180px">Version</nve-grid-column>
        <nve-grid-column name="Template References" width="180px">Template References</nve-grid-column>
        <nve-grid-column name="Import References" width="180px">Import References</nve-grid-column>
        <nve-grid-column name="Style References">Style References</nve-grid-column>
      </nve-grid-header>
      ${metricsUsage.projects
        .sort((a, b) => {
          if (a.elementsVersion.includes('.') && b.elementsVersion.includes('.')) {
            return compareVersions(a.elementsVersion, b.elementsVersion);
          }
          return -1;
        })
        .sort((a, b) => (a.url?.includes('git-av.nvidia.com') ? 1 : -1))
        .reverse()
        .map(project => {
          const { elementReferenceTotal, importReferenceTotal, styleReferenceTotal } = computeReferences(project);
          return /* html */ `<nve-grid-row>
          <nve-grid-cell><a nve-text="link" href="${project.url}" target="_blank">${project.name ?? 'unknown'}</a></nve-grid-cell>
          <nve-grid-cell>${project.url.includes('git-av.nvidia.com') ? 'AV Infra' : 'Gitlab'}</nve-grid-cell>
          <nve-grid-cell><code nve-text="code">${project.path}</code></nve-grid-cell>
          <nve-grid-cell>${getVersionBadge(project.elementsVersion)}</nve-grid-cell>
          <nve-grid-cell>${elementReferenceTotal}</nve-grid-cell>
          <nve-grid-cell>${importReferenceTotal}</nve-grid-cell>
          <nve-grid-cell>${styleReferenceTotal}</nve-grid-cell>
        </nve-grid-row>`;
        })
        .join('')}
      <nve-grid-footer>
        <p nve-text="body muted sm">Report Created on ${reportDate}</p>
      </nve-grid-footer>
    </nve-grid>
  </div>
</div>
<nve-dialog id="additional-information-dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading">Additional Information</h3>
  </nve-dialog-header>
  <dl nve-layout="grid gap:lg">
    <dt nve-layout="span:4" nve-text="body muted medium">Element Reference</dt>
    <dd nve-layout="span:8" nve-text="body">A reference to an Elements component API in a template/html format file. (html, js, ts, tsx)</dd>
    <dt nve-layout="span:4" nve-text="body muted medium">Attribute Reference</dt>
    <dd nve-layout="span:8" nve-text="body">A reference to an Elements utility attribute API in a template/html format file. (html, js, ts, tsx)</dd>
    <dt nve-layout="span:4" nve-text="body muted medium">Import Reference</dt>
    <dd nve-layout="span:8" nve-text="body">A reference a Elements library module import. (js, ts, css)</dd>
    <dt nve-layout="span:4" nve-text="body muted medium">Style Reference</dt>
    <dd nve-layout="span:8" nve-text="body">A reference to a CSS theme variable. (--nve-)</dd>
    <dt nve-layout="span:4" nve-text="body muted medium"><code nve-text="code">unknown</code></dt>
    <dd nve-layout="span:8" nve-text="body">The project has not been reported yet or a reference could not be determined yet.</dd>
    <dt nve-layout="span:4" nve-text="body muted medium">(<code nve-text="code">-</code>)</dt>
    <dd nve-layout="span:8" nve-text="body">The project references are already accounted for in a parent directory project.</dd>
  </dl>
</nve-dialog>`,
    'html'
  );
}

const reportedRepos = new Set();

function computeReferences(project) {
  let elementReferenceTotal = '-';
  let importReferenceTotal = '-';
  let styleReferenceTotal = '-';

  if (project.url.includes('gitlab') && !reportedRepos.has(project.url)) {
    elementReferenceTotal = project.elementReferenceTotal;
    importReferenceTotal = project.importReferenceTotal;
    styleReferenceTotal = project.styleReferenceTotal;
    reportedRepos.add(project.url);
  }

  if (project.url.includes('git-av.nvidia.com')) {
    elementReferenceTotal = project.elementReferenceTotal;
    importReferenceTotal = project.importReferenceTotal;
    styleReferenceTotal = project.styleReferenceTotal;
  }

  elementReferenceTotal = elementReferenceTotal === 0 ? 'unknown' : elementReferenceTotal;
  importReferenceTotal = importReferenceTotal === 0 ? 'unknown' : importReferenceTotal;
  styleReferenceTotal = styleReferenceTotal === 0 ? 'unknown' : styleReferenceTotal;
  return { elementReferenceTotal, importReferenceTotal, styleReferenceTotal };
}

const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(metricsUsage.created)
);

function getVersionNum(value) {
  return parseFloat(`${value.replace('^', '').replace('~', '')}`);
}

function getVersionBadge(value) {
  const latestBetaElementsRelease = 41; // last minor patch for 0.x was 0.41.0;
  const projectMinorVersion = parseFloat(`${value.split('.')[1]}`);

  let status = 'success';

  if (value === 'catalog:' || value === 'latest') {
    status = 'queued';
  }

  if (value === '0.0.0' || value === '') {
    status = 'pending';
    value = 'unknown';
  }

  if (getVersionNum(value) < 1.0) {
    status = 'warning';
  }

  if (
    (getVersionNum(value) < 1.0 && latestBetaElementsRelease - projectMinorVersion > 10) ||
    value.includes('workspace')
  ) {
    status = 'danger';
  }

  return /* html */ `<nve-badge status="${status}">${value.replace('^', '').replace('~', '')}</nve-badge>`;
}
