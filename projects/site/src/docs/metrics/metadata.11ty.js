import { ESM_ELEMENTS_VERSION } from '@nve-internals/elements-api';

export const data = {
  title: 'Metadata',
  layout: 'docs.11ty.js'
};

export function render() {
  return /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:lg">
    <div nve-layout="row gap:md align:vertical-center">
      <h1 nve-text="heading lg">Elements</h1>
      <nve-badge status="success">version ${ESM_ELEMENTS_VERSION}</nve-badge>
    </div>
    <p nve-text="body muted">Below are metrics measuring various aspects of the Elements system including usage, test coverage and API stability.</p>
  </div>

  <div nve-layout="column gap:xs align:stretch">
    <nve-tabs style="height: 32px">
      <nve-tabs-item><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/elements/">Maglev</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>

    <nve-divider></nve-divider>

    <div nve-layout="column gap:lg align:right">
      <nve-button><a target="_blank" href="https://NVIDIA.github.io/elements/metadata/index.json">download</a></nve-button>
      
      <pre style="overflow: scroll;" nve-layout="full"></pre>
    </div>
  </div>
</div>
<script type="module">
  import { MetadataService } from '@nve-internals/metadata';
  const metrics = await MetadataService.getMetadata();
  document.querySelector('pre').textContent = JSON.stringify(metrics, null, 2);
</script> `;
}
