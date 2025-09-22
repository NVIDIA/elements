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
<style>
  [nve-text='heading lg mkd'] {
    border-bottom: 0 !important;
    padding: 0 !important;
  }

  nve-breadcrumb + h2 {
    padding-top: 0 !important;
  }
</style>

# Changelog - ${data.changelog.title}

<nve-breadcrumb>
  <nve-button container="inline"><a href="docs/changelog/" target="_self">Changelogs</a></nve-button>
  <span>${data.changelog.title}</span>
</nve-breadcrumb>

<p nve-text="heading muted sm">${data.changelog.description}</p>

${data.changelog.changelog}
`,
    'md'
  );
}
