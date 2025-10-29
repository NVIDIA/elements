import { MetadataService, UsageService } from '@nve-internals/metadata';
import { compareVersions } from 'compare-versions';
import { ESM_ELEMENTS_VERSION } from '../../_11ty/utils/version.js';

const metrics = await MetadataService.getMetadata();
const metricsUsage = await UsageService.getMetadata();

export const data = {
  title: 'Usage Metrics',
  layout: 'docs.11ty.js'
};

const elementReferences = metricsUsage.projects.reduce((p, n) => ({ ...p, [n.name]: n.elementReferenceTotal }), {});
const importReferences = metricsUsage.projects.reduce((p, n) => ({ ...p, [n.name]: n.importReferenceTotal }), {});

const totalElementReferenceTotal = Object.values(elementReferences).reduce((p, n) => n + p, 0);
const totalImportReferenceTotal = Object.values(importReferences).reduce((p, n) => n + p, 0);

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
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/usage-metrics/">Usage Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <div nve-layout="row gap:md align:vertical-center">
      <h3 nve-text="body bold">Summary:</h3>
      <section nve-layout="row gap:xs align:center">
        <span nve-text="body sm muted">Total Projects</span>
        <nve-badge status="queued">${metricsUsage.projects.length}</nve-badge>
      </section>
      <section nve-layout="row gap:xs align:center">
        <span nve-text="body sm muted">Total Element Template References</span>
        <nve-badge status="accent">${totalElementReferenceTotal}</nve-badge>
      </section>
      <section nve-layout="row gap:xs align:center">
        <span nve-text="body sm muted">Total Import Source References</span>
        <nve-badge status="accent">${totalImportReferenceTotal}</nve-badge>
      </section>
      <nve-icon-button popovertarget="additional-information-dialog" icon-name="information-circle-stroke" container="flat" aria-label="additional information"></nve-icon-button>
    </div>
    <nve-grid style="--scroll-height: calc(100vh - 330px)">
      <nve-grid-header>
        <nve-grid-column name="Project" width="300px">Project</nve-grid-column>
        <nve-grid-column name="Repo" width="150px">Repo</nve-grid-column>
        <nve-grid-column name="Source" width="450px">Path</nve-grid-column>
        <nve-grid-column name="Version" width="180px">Version</nve-grid-column>
        <nve-grid-column name="Template References" width="180px">Template References</nve-grid-column>
        <nve-grid-column name="Import References">Import References</nve-grid-column>
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
          const { elementReferenceTotal, importReferenceTotal } = computeReferences(project);
          return /* html */ `<nve-grid-row>
          <nve-grid-cell><a href="${project.url}" target="_blank">${project.name ?? 'unknown'}</a></nve-grid-cell>
          <nve-grid-cell>${project.url.includes('git-av.nvidia.com') ? 'AV Infra' : 'Gitlab'}</nve-grid-cell>
          <nve-grid-cell><code nve-text="code">${project.path}</code></nve-grid-cell>
          <nve-grid-cell>${getVersionBadge(project.elementsVersion)}</nve-grid-cell>
          <nve-grid-cell>${elementReferenceTotal}</nve-grid-cell>
          <nve-grid-cell>${importReferenceTotal}</nve-grid-cell>
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
  <nve-dialog-content>
    <dl nve-layout="grid gap:lg">
      <dt nve-layout="span:4" nve-text="body muted medium">Template Reference</dt>
      <dd nve-layout="span:8" nve-text="body">A reference to an Elements API in a template/html format file. (html, js, ts, tsx)</dd>
      <dt nve-layout="span:4" nve-text="body muted medium">Import Reference</dt>
      <dd nve-layout="span:8" nve-text="body">A reference a Elements library module import. (js, ts, css)</dd>
      <dt nve-layout="span:4" nve-text="body muted medium"><code>unknown</code></dt>
      <dd nve-layout="span:8" nve-text="body">The project has not been reported yet or a reference could not be determined yet.</dd>
      <dt nve-layout="span:4" nve-text="body muted medium">(<code>-</code>)</dt>
      <dd nve-layout="span:8" nve-text="body">The project references are already accounted for in a parent directory project.</dd>
    </dl>
  </nve-dialog-content>
</nve-dialog>`,
    'html'
  );
}

const reportedRepos = new Set();

function computeReferences(project) {
  let elementReferenceTotal = '-';
  let importReferenceTotal = '-';

  if (project.url.includes('gitlab') && !reportedRepos.has(project.url)) {
    elementReferenceTotal = project.elementReferenceTotal;
    importReferenceTotal = project.importReferenceTotal;
    reportedRepos.add(project.url);
  }

  if (project.url.includes('git-av.nvidia.com')) {
    elementReferenceTotal = project.elementReferenceTotal;
    importReferenceTotal = project.importReferenceTotal;
  }

  elementReferenceTotal = elementReferenceTotal === 0 ? 'unknown' : elementReferenceTotal;
  importReferenceTotal = importReferenceTotal === 0 ? 'unknown' : importReferenceTotal;

  return { elementReferenceTotal, importReferenceTotal };
}

const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(metrics.created)
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

  if (value === '0.0.0') {
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
