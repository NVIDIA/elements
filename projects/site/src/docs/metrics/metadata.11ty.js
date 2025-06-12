import { ESM_ELEMENTS_VERSION } from '../../_11ty/utils/version.js';

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
      <nve-tabs-item><a href="docs/metrics/av-infra/">AV Infra</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>

    <nve-divider></nve-divider>

    <div nve-layout="column gap:xs">
      <div nve-layout="row gap:xs align:vertical-center full">
        <nve-alert style="--color: var(--nve-sys-text-muted-color)" status="warning">The schema for this metadata is currently subject to change.</nve-alert>
        <nve-button style="margin-left: auto;"><a target="_blank" href="https://NVIDIA.github.io/elements/metadata/index.json">Download</a></nve-button>
      </div>
      
      <nve-monaco-input style="--min-height: calc(100vh - 303px);" folding language="json" readonly minimap></nve-monaco-input>
    </div>
  </div>
</div>
<script type="module">
  import '@nvidia-elements/monaco/input/index.js';
  import { MetadataService } from '@internals/metadata/services/metadata.service.js';
  // todo: this should be computed at build time with 11ty and not at runtime as this is a node library atm
  const metrics = await MetadataService.getMetadata();
  document.querySelector('nve-monaco-input').value = JSON.stringify(metrics, null, 2);
</script> `;
}
