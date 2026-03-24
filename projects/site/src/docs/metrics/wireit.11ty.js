// @ts-check

import { siteData } from '../../index.11tydata.js';

export const data = {
  title: 'Wireit Explorer',
  layout: 'docs.11ty.js'
};

const { wireit } = siteData;

export function render() {
  return this.renderTemplate(
    /* html */ `
<style>
  #graph {
    width: 100%;
    min-height: 100%;
  }

  section:has(#controls) {
    position: relative;
    height: 100%;
  }

  #doc-content,
  [docs-full-width] {
    height: 100%;
  }

  #controls {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    width: 250px;
  }

  #doc-content {
    padding-bottom: 0 !important;
  }

  .float-tooltip-kap {
    padding: 6px;
    border-radius: 4px;
    background: var(--nve-sys-layer-overlay-background);
  }
</style>
<div nve-layout="column gap:md align:horizontal-stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <div nve-layout="row gap:md align:vertical-center">
      <h1 nve-text="heading lg">Wireit Explorer</h1>
    </div>
    <p nve-text="body muted">Below is an interactive graph of the CI build workflow and the dependencies between Wireit scripts.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item selected><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
  </div>
  <section>
    <nve-card id="controls">
      <nve-card-header>
        <h3 nve-text="heading sm">Wireit Explorer</h3>
      </nve-card-header>
      <nve-card-content>
        <div nve-layout="column gap:md">
          <nve-search>
            <label>Search Nodes</label>
            <input type="search" id="search" placeholder="Type to filter...">
          </nve-search>
          <nve-checkbox>
            <label>Connection Weights</label>
            <input type="checkbox" id="show-congestion" checked />
          </nve-checkbox>
        </div>
      </nve-card-content>
      <nve-divider></nve-divider>
      <nve-card-content>
        <div class="legend">
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #5dafee;"></nve-dot>
            <span>Root</span>
          </div>
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #46a458;"></nve-dot>
            <span>Elements</span>
          </div>
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #8e4ec6;"></nve-dot>
            <span>Labs</span>
          </div>
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #e5484d;"></nve-dot>
            <span>Internals</span>
          </div>
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #f66807;"></nve-dot>
            <span>Starters</span>
          </div>
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #ffc801;"></nve-dot>
            <span>Themes/Styles</span>
          </div>
          <div nve-layout="row gap:xs">
            <nve-dot style="--background: #8b949e;"></nve-dot>
            <span>Other</span>
          </div>
        </div>
      </nve-card-content>
      <nve-divider></nve-divider>
      <nve-card-content>
        <div nve-layout="row gap:xs align:vertical-center">
          <span nve-text="body muted sm">Total Scripts:</span>
          <span id="stat-scripts">0</span>
        </div>
        <div nve-layout="row gap:xs align:vertical-center">
          <span nve-text="body muted sm">Total Links:</span>
          <span id="stat-links">0</span>
        </div>
        <div nve-layout="row gap:xs align:vertical-center">
          <span nve-text="body muted sm">Visible Scripts:</span>
          <span id="stat-visible">0</span>
        </div>
      </nve-card-content>
    </nve-card>
    <div id="graph"></div>
  </section>
  <script type="module">globalThis.wireitData = ${JSON.stringify(wireit, null, 2)};</script>
  <script type="module" src="/docs/metrics/wireit.ts"></script>
</div>
  `.replaceAll('\n', ''),
    'md'
  );
}
