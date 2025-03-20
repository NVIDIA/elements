import { ESM_ELEMENTS_VERSION } from '@nve-internals/elements-api';
import { MetadataService } from '@nve-internals/metadata';
import { compareVersions } from 'compare-versions';

export const data = {
  title: 'Maglev',
  layout: 'docs.11ty.js'
};

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
      <nve-tabs-item selected><a href="docs/metrics/elements/">Maglev</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <div nve-layout="row gap:md align:vertical-center">
      <h3 nve-text="body bold">Summary:</h3>
      <section nve-layout="row gap:xs align:center">
        <span nve-text="body sm muted">Total Maglev Instances</span>
        <span nve-text="body sm bold"><nve-badge status="queued">${metricsMaglev.projects.reduce((p, n) => n.instanceTotal + p, 0)}</nve-badge></span>
      </section>
    </div>
    <nve-tooltip id="instance-total-tooltip" style="--width: 300px">
      Number of instances of elements directly in MagLev source. Note this does not account for runtime instances created from reusable abstractions.
    </nve-tooltip>
    <nve-grid style="--scroll-height: calc(100vh - 330px)">
      <nve-grid-header>
        <nve-grid-column name="Project" width="300px">Project</nve-grid-column>
        <nve-grid-column name="Version" width="300px">Version</nve-grid-column>
        <nve-grid-column name="Instances" width="300px" popoverTarget="instance-total-tooltip">Instances</nve-grid-column>
        <nve-grid-column name="Source" width="">Source</nve-grid-column>
      </nve-grid-header>
      ${metricsMaglev.projects
        .sort((a, b) => compareVersions(a.elementsVersion, b.elementsVersion))
        .reverse()
        .map(
          project => /* html */ `<nve-grid-row>
        <nve-grid-cell>${project.name ?? 'unknown'}</nve-grid-cell>
        <nve-grid-cell>${getVersionBadge(project.elementsVersion)}</nve-grid-cell>
        <nve-grid-cell>${project.instanceTotal}</nve-grid-cell>
        <nve-grid-cell><code nve-text="code">${project.path}</code></nve-grid-cell>
      </nve-grid-row>`
        )
        .join('')}
      <nve-grid-footer>
        <p nve-text="body muted sm">Report Created on ${reportDate}</p>
      </nve-grid-footer>
    </nve-grid>
  </div>
</div>`,
    'md'
  );
}

const metrics = await MetadataService.getMetadata();
const metricsMaglev = await MetadataService.getMaglevMetadata();
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
