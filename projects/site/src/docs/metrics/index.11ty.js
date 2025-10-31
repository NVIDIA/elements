// @ts-check

import { MetadataService, UsageService, DownloadService, ReleasesService, TestsService } from '@internals/metadata';

export const data = {
  title: 'Metrics',
  layout: 'docs.11ty.js'
};

const metadataMetrics = await MetadataService.getMetadata();
const releases = await ReleasesService.getReleases();
const testMetrics = await TestsService.getTests();
const downloads = await DownloadService.getDownloads();
const usageMetrics = await UsageService.getMetadata();

const usageMetricsReportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(usageMetrics.created)
);

const referenceTotal = usageMetrics.projects.reduce((p, n) => p + n.referenceTotal, 0);
const elementTotal = Object.values(metadataMetrics.projects).flatMap(project => project.elements).length;

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
      <nve-tabs-item><a href="docs/metrics/usage-metrics/">Usage &amp; Adoption</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <p nve-text="body muted sm" nve-layout="pad-y:xs">
      Metrics last updated on ${usageMetricsReportDate}.
    </p>
    <div class="dashboard">
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Top Components by Template Reference</h3>
          <p nve-text="body muted sm">Top 25 components found and referenced in HTML templates</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="top-components-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
        <h3 nve-text="heading sm medium"><span nve-text="emphasis">${usageMetrics.projects.length}</span> Dependents / Projects</h3>
          <p nve-text="body muted sm">Top projects with the most found source code API references</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="top-projects-by-adoption-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">${downloads.totalDownloads.toLocaleString()}</span> Package Downloads</h3>
          <p nve-text="body muted sm">Downloads per package, segmented by Artifactory registry instance</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="downloads-by-instance-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">${releases.releases.length.toLocaleString()} Total Cumulative Releases</h3>
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
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">Adoption Curve</h3>
          <p nve-text="body muted sm">Number of downloads relative to number of releases</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="relative-adoption-chart"></canvas>
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
          <h3 nve-text="heading sm medium">Version Distribution</h3>
          <p nve-text="body muted sm">Adoption of different version ranges of the Elements packages</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="version-adoption-chart" style="margin: auto;" width="350" height="270"></canvas>
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
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">${referenceTotal.toLocaleString()}</span> API Source Code References</h3>
          <p nve-text="body muted sm">Known API source code references across all known projects</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="api-references-chart" style="margin: auto;" width="440"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Most Downloaded Versions</h3>
          <p nve-text="body muted sm">Top downloaded versions across all packages</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="top-versions-chart"></canvas>
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
          <h3 nve-text="heading sm medium">Project Adoption by Repository</h3>
          <p nve-text="body muted sm">Number of projects found using Elements grouped by Git platform/repository.</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="repo-adoption-chart" style="margin: auto;" width="440"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Total Downloads by Repository</h3>
          <p nve-text="body muted sm">Total downloads across all packages and Artifactory instances</p>
        </nve-card-header>
        <nve-card-content>
          <canvas id="total-downloads-chart" style="margin: auto;" width="440"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">Frontend Dependencies Distribution</h3>
          <p nve-text="body muted sm">Distribution of popular frontend frameworks and libraries across all projects</p>
        </nve-card-header>
        <nve-card-content style="--padding: 0;">
          <canvas id="frontend-dependencies-distribution-chart" style="margin: auto;" width="440"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium"><span nve-text="emphasis">${downloads.packages.length}</span> Published Packages</h3>
          <p nve-text="body muted sm">Relative download distribution across published packages</p>
        </nve-card-header>
        <nve-card-content style="--padding: 0;">
          <canvas id="package-distribution-chart" height="370"></canvas>
        </nve-card-content>
      </nve-card>
    </div>
    <script type="module" src="/docs/metrics/index.ts"></script>`,
    'html'
  );
}
