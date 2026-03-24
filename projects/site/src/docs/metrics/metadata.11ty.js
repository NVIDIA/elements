// @ts-check

export const data = {
  title: 'Metadata',
  layout: 'docs.11ty.js'
};

export function render() {
  return /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:sm">
    <div nve-layout="row gap:md align:vertical-center">
      <h1 nve-text="heading lg">Metadata Source</h1>
    </div>
    <p nve-text="body muted">Below is the raw API metadata for the Elements system.</p>
  </div>

  <div nve-layout="column gap:xs align:stretch">
    <nve-tabs style="height: 32px">
      <nve-tabs-item><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/api-status/">API Status</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>

    <nve-divider></nve-divider>

    <div nve-layout="column gap:xs">
      <div nve-layout="row gap:xs align:vertical-center full">
        <nve-alert style="--color: var(--nve-sys-text-muted-color)" status="warning">The schema for this metadata is currently subject to change.</nve-alert>
        <nve-button style="margin-left: auto;"><a target="_blank" href="https://NVIDIA.github.io/elements/metadata/index.json">Download</a></nve-button>
      </div>
      
      <nve-monaco-input style="--min-height: calc(100vh - 300px);" folding language="json" readonly minimap></nve-monaco-input>
    </div>
  </div>
</div>
<script type="module">
  import '@nvidia-elements/monaco/input/index.js';
  import { ApiService } from '@internals/metadata/services/api.service.js';
  const metrics = await ApiService.getData();
  document.querySelector('nve-monaco-input').value = JSON.stringify(metrics, null, 2);
</script> `;
}
