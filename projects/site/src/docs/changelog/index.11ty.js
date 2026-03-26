import changelogs from './index.11tydata.js';
import { ELEMENTS_REPO_BASE_URL } from '../../_11ty/utils/env.js';

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
  <a href="${ELEMENTS_REPO_BASE_URL}/-/releases"><img src="${ELEMENTS_REPO_BASE_URL}/-/badges/release.svg?value_width=200" alt="release"></a>
  <a href="${ELEMENTS_REPO_BASE_URL}/-/commits/main"><img src="${ELEMENTS_REPO_BASE_URL}/badges/main/pipeline.svg" alt="pipeline status"></a>
  <a href="${ELEMENTS_REPO_BASE_URL}/-/graphs/main/charts"><img src="${ELEMENTS_REPO_BASE_URL}/badges/main/coverage.svg?min_good=90&amp;key_text=coverage" alt="coverage"></a>
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
