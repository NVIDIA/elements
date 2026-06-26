// @ts-check

import { ReleasesService, TestsService, ApiService, AdoptionService } from '@internals/metadata';

export const data = {
  title: 'Metrics',
  description: 'NVIDIA Elements quality metrics for tests, coverage, bundle size, and API status.',
  layout: 'docs.11ty.js'
};

const releases = await ReleasesService.getData();
const testMetrics = await TestsService.getData();
const apiMetrics = await ApiService.getData();
const adoption = await AdoptionService.getData();

const releasesReportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(releases.created)
);

const elementTotal = apiMetrics.data.elements.length;

const totalTests = Object.values(testMetrics.projects).reduce(
  (p, n) =>
    p +
    n.unit.numPassedTests +
    n.visual.numPassedTests +
    n.axe.numPassedTests +
    n.ssr.numPassedTests +
    n.lighthouse.testResults.length,
  0
);

function formatNumber(value) {
  return value.toLocaleString();
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value)) : 'Unavailable';
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function getPackageLabel(packageName) {
  return packageName.replace('@nvidia-elements/', '');
}

function getAdoptionStatus(packageData) {
  if (packageData.status === 'unavailable') {
    return /* html */ `<nve-badge status="warning" container="flat">unavailable</nve-badge>`;
  }

  if (packageData.status === 'partial') {
    return /* html */ `<nve-badge status="warning" container="flat">partial</nve-badge>`;
  }

  return /* html */ `<nve-badge status="success" container="flat">published</nve-badge>`;
}

function getTopCdnVersion(packageData) {
  return packageData.cdn.topVersion
    ? `${packageData.cdn.topVersion.version} (${formatPercent(packageData.cdn.topVersion.share)})`
    : 'None';
}

export function render() {
  return this.renderTemplate(
    /* html */ `
<style>
  nve-card {
    min-height: 38cqh;
    height: 100%;

    nve-card-content {
      --padding: var(--nve-ref-size-200);
      container-type: size;
      contain: layout;
      height: 100%;
      align-items: center;
      justify-content: center;
      display: flex;
    }
  }
</style>
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <h1 nve-text="heading lg">Metrics</h1>
    <p nve-text="body muted">
      Metrics and insights into the usage of the Elements APIs including, top components/projects by template and import references, version adoption, and repository projects.
    </p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item selected><a href="/docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="/docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="/docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="/docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="/docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="/docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <p nve-text="body muted sm" nve-layout="pad-y:xs">
      Metrics last updated on ${releasesReportDate}.
    </p>
    <div nve-layout="row gap:md align:wrap align:vertical-center" nve-text="body sm">
      <span><span nve-text="emphasis">${formatNumber(adoption.totals.npmDownloads)}</span> npm downloads</span>
      <span><span nve-text="emphasis">${formatNumber(adoption.totals.cdnRequests)}</span> CDN requests</span>
      <span><span nve-text="emphasis">${formatNumber(adoption.github.stars)}</span> stars</span>
      <span><span nve-text="emphasis">${formatNumber(adoption.github.contributors)}</span> contributors</span>
    </div>
    <div nve-layout="grid gap:md span-items:12 &lg|span-items:6 &xl|span-items:4">
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">${releases.data.length.toLocaleString()} Total Cumulative Releases</h3>
          <p nve-text="body muted sm">Weekly cumulative automated releases across all packages</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="total-releases-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">${elementTotal.toLocaleString()}</span> Total Cumulative Elements</h3>
          <p nve-text="body muted sm">Total number of elements available over the library's version history</p>
        </nve-card-header>
        <nve-card-content style="--padding: var(--nve-ref-size-400);">
          <canvas id="elements-growth-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Release Distribution</h3>
          <p nve-text="body muted sm">Weekly distribution of semantic release types across all packages</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="release-type-distribution-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Package Downloads Trend</h3>
          <p nve-text="body muted sm">Stacked daily npm download requests by package over the last month.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="adoption-downloads-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Component Complexity Score</h3>
          <p nve-text="body muted sm">Bundle size (KB) vs complexity (branches), colored by test coverage.</p>
        </nve-card-header>
        <nve-card-content style="flex-direction: column;">
          <div nve-layout="column full align:horizontal-center">
            <div nve-layout="row gap:xs align:center full" nve-text="body muted sm" style="height: 24px; margin-top: 5cqh;">
              <span nve-layout="row gap:xs"><nve-dot style="--background: var(--nve-sys-visualization-categorical-grass)"></nve-dot> ≥95% coverage</span>
              <span nve-layout="row gap:xs"><nve-dot style="--background: var(--nve-sys-visualization-categorical-cyan)"></nve-dot> ≥90% coverage</span>
              <span nve-layout="row gap:xs"><nve-dot style="--background: var(--nve-sys-visualization-categorical-amber)"></nve-dot> ≥85% coverage</span>
              <span nve-layout="row gap:xs"><nve-dot style="--background: var(--nve-sys-visualization-categorical-red)"></nve-dot> &lt;85% coverage</span>
            </div>
            <div nve-layout="column align:center" style="width: 100%; height: calc(100cqh - 24px);">
              <canvas id="component-complexity-score-chart"></canvas>
            </div>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">${totalTests.toLocaleString()}</span> Tests and Type Distribution</h3>
          <p nve-text="body muted sm">Distribution of test types across all projects.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="test-distribution-chart" style="margin: auto;" width="440"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Release to Adoption Overlay</h3>
          <p nve-text="body muted sm">npm and CDN activity with npm publish markers in the same window.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="adoption-release-overlay-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">CDN Version Adoption</h3>
          <p nve-text="body muted sm">Latest, leading non-latest, and other jsDelivr request share by package.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="adoption-cdn-version-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">npm vs CDN Channel Mix</h3>
          <p nve-text="body muted sm">Build-time package downloads compared with browser CDN requests.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="adoption-channel-mix-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">GitHub Interest Momentum</h3>
          <p nve-text="body muted sm">Public stargazer growth from GitHub API timestamps.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="adoption-github-interest-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-grid>
        <nve-grid-header>
          <nve-grid-column width="220px">Package</nve-grid-column>
          <nve-grid-column width="130px">Status</nve-grid-column>
          <nve-grid-column width="150px">Latest npm</nve-grid-column>
          <nve-grid-column width="180px">Published</nve-grid-column>
          <nve-grid-column width="130px">Versions</nve-grid-column>
          <nve-grid-column width="160px">npm downloads</nve-grid-column>
          <nve-grid-column width="160px">CDN requests</nve-grid-column>
          <nve-grid-column>Top CDN version</nve-grid-column>
        </nve-grid-header>
        ${adoption.packages
          .map(
            packageData => /* html */ `<nve-grid-row>
              <nve-grid-cell><p nve-text="body truncate">${getPackageLabel(packageData.name)}</p></nve-grid-cell>
              <nve-grid-cell>${getAdoptionStatus(packageData)}</nve-grid-cell>
              <nve-grid-cell>${packageData.latestVersion ?? 'Unavailable'}</nve-grid-cell>
              <nve-grid-cell>${formatDate(packageData.publishedAt)}</nve-grid-cell>
              <nve-grid-cell>${formatNumber(packageData.versionCount)}</nve-grid-cell>
              <nve-grid-cell>${formatNumber(packageData.npm.total)}</nve-grid-cell>
              <nve-grid-cell>${formatNumber(packageData.cdn.total)}</nve-grid-cell>
              <nve-grid-cell>${getTopCdnVersion(packageData)}</nve-grid-cell>
            </nve-grid-row>`
          )
          .join('')}
        <nve-grid-footer>
          <p nve-text="body muted sm">${formatNumber(adoption.totals.publishedPackages)} published packages, ${formatNumber(adoption.totals.partialPackages)} partial packages, ${formatNumber(adoption.totals.unavailablePackages)} unavailable packages.</p>
        </nve-grid-footer>
      </nve-grid>
    </div>
    <script type="module" src="/docs/metrics/index.ts"></script>
    <script type="module" src="/docs/metrics/adoption.ts"></script>`,
    'html'
  );
}
