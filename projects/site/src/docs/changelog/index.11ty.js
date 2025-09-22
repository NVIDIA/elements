import changelogs from './index.11tydata.js';

export const data = {
  title: 'Changelog',
  layout: 'docs.11ty.js'
};

export function render() {
  return this.renderTemplate(
    /* html */ `
<style>
  nve-card-header,
  nve-card-content,
  nve-card-footer {
    cursor: pointer;
  }
</style>

# Changelog

<div nve-layout="row gap:sm" style="height: 24px">
  <a href="https://github.com/NVIDIA/elements/-/releases"><img src="https://github.com/NVIDIA/elements/-/badges/release.svg?value_width=200" alt="release"></a>
  <a href="https://github.com/NVIDIA/elements/-/commits/main"><img src="https://github.com/NVIDIA/elements/badges/main/pipeline.svg" alt="pipeline status"></a>
  <a href="https://github.com/NVIDIA/elements/-/graphs/main/charts"><img src="https://github.com/NVIDIA/elements/badges/main/coverage.svg?min_good=90&amp;key_text=coverage" alt="coverage"></a>
</div>

<section nve-layout="grid span-items:12 &sm|span-items:6 &lg|span-items:4 gap:sm align:vertical-stretch">
${changelogs
  .map(
    changelog => /* html */ `
<a href="docs/changelog${changelog.permalink}" style="text-decoration: none;">
<nve-card style="height: 100%;">
  <nve-card-header>
    <div nve-layout="row gap:sm align:space-between align:vertical-center">
      <h3 nve-text="heading sm">${changelog.title}</h3>
      <nve-badge status="success" container="flat">${changelog.version}</nve-badge>
    </div>
  </nve-card-header>
  <nve-card-content>
    <p nve-text="body sm">${changelog.description ?? ''}</p>
  </nve-card-content>
  <nve-card-footer>
    <nve-button container="inline" style="margin-left: auto;">View Changelog</nve-button>
  </nve-card-footer>
</nve-card>
</a>
`
  )
  .join('')}
</section>
`,
    'md'
  );
}
