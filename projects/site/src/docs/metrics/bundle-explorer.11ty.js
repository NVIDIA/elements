export const data = {
  title: 'Bundle Explorer',
  layout: 'docs.11ty.js'
};

export function render() {
  return this.renderTemplate(
    /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <h1 nve-text="heading lg">Bundle Explorer</h1>
    <p nve-text="body muted">Report of the bundle size and composition of the Elements core package.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item selected><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
  </div>
  <iframe id="bundle" class="bundle" src="docs/metrics/bundle-explorer-report/" style="border: 0; height: calc(100vh - 230px); margin-top: -24px"></iframe>
</div>
  `,
    'md'
  );
}
