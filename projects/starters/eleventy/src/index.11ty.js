export const data = {
  title: 'Eleventy + Elements',
  layout: 'index.11ty.js'
};

export function render(data) {
  return this.renderTemplate(
    /* markdown */ `
<nve-tabs>
  <nve-tabs-item selected><a href="./">Home</a></nve-tabs-item>
  <nve-tabs-item><a href="about/">About</a></nve-tabs-item>
  <nve-tabs-item><a href="settings/">Settings</a></nve-tabs-item>
</nve-tabs>
<p nve-text="body">A simple starter using Elements and Eleventy.</p>
<div nve-layout="row gap:xs">
  <a nve-text="body sm" target="_blank" href="https://NVIDIA.github.io/elements/docs/integrations/eleventy/">Documentation</a>
  <a nve-text="body sm" target="_blank" href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/eleventy">Source</a>
  <a nve-text="body sm" download href="https://NVIDIA.github.io/elements/starters/download/angular.zip">Download</a>
</div>
`,
    'md'
  );
}
