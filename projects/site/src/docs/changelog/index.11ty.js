import changelogs from './index.11tydata.js';

export const data = {
  title: 'Changelog',
  layout: 'docs.11ty.js',
  pagination: {
    data: 'changelogs',
    size: 1,
    alias: 'changelog'
  },
  changelogs,
  permalink: data => `docs/changelog${data.changelog.permalink}index.html`
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
# Changelog

<style>
  [nve-text='heading lg mkd'] {
    border-bottom: 0 !important;
    padding: 0 !important;
  }
</style>
<div nve-layout='row gap:sm'>
  <a href='https://github.com/NVIDIA/elements/-/releases'><img src='https://github.com/NVIDIA/elements/-/badges/release.svg?value_width=200' alt='release'></a>
  <a href='https://github.com/NVIDIA/elements/-/commits/main'><img src='https://github.com/NVIDIA/elements/badges/main/pipeline.svg' alt='pipeline status'></a>
  <a href='https://github.com/NVIDIA/elements/-/graphs/main/charts'><img src='https://github.com/NVIDIA/elements/badges/main/coverage.svg?min_good=90&amp;key_text=coverage' alt='coverage'></a>
</div>
<nve-tabs>
  ${data.changelogs
    .map(
      changelog => `<nve-tabs-item ${changelog.permalink === data.changelog.permalink ? 'selected' : ''}>
    <a href='docs/changelog${changelog.permalink}'>${changelog.title}</a>
  </nve-tabs-item>`
    )
    .join('')}
</nve-tabs>

${data.changelog.changelog}
`,
    'md'
  );
}
