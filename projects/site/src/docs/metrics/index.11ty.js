// @ts-check

import { ReleasesService, TestsService, ApiService } from '@internals/metadata';

export const data = {
  title: 'Metrics',
  layout: 'docs.11ty.js'
};

const releases = await ReleasesService.getData();
const testMetrics = await TestsService.getData();
const apiMetrics = await ApiService.getData();

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

export function render() {
  return this.renderTemplate(
    /* html */ `
<style>
  .dashboard {
    contain: layout;
    display: grid;
    gap: var(--nve-ref-space-sm);
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(480px, 1fr) );
  }

  @media (min-width: 1600px) {
    .dashboard {
      grid-template-columns: repeat(auto-fill, minmax(580px, 1fr) );
    }
  }

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
      <nve-tabs-item selected><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <p nve-text="body muted sm" nve-layout="pad-y:xs">
      Metrics last updated on ${releasesReportDate}.
    </p>
    <div class="dashboard">
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">${releases.data.length.toLocaleString()} Total Cumulative Releases</h3>
          <p nve-text="body muted sm">Total automated releases across all packages</p>
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
          <p nve-text="body muted sm">Distribution of semantic release types across all packages</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="release-type-distribution-chart"></canvas>
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
    </div>
    <script type="module" src="/docs/metrics/index.ts"></script>`,
    'html'
  );
}
