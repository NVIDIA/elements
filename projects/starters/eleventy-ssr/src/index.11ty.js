// @ts-check

import { MetadataService } from '@nve-internals/metadata';

const metadata = await MetadataService.getMetadata();

const stories = metadata.projects['@nvidia-elements/core'].elements
  .filter(e => !e.name.includes('nve-page-loader') && !e.name.includes('nve-app-header'))
  .filter(e => e.stories?.items?.find(s => s.id.includes('Default')))
  .map(e => {
    const story = e.stories?.items?.find(s => s.id.includes('Default'));
    let template = story?.template.includes('${') ? '' : story?.template;
    template = template
      ?.replaceAll('<label>', '<label slot="label">')
      ?.replaceAll('<nve-control-message>', '<nve-control-message slot="messages">');
    return {
      name: e.name,
      entrypoint: e.manifest?.metadata?.entrypoint,
      template
    };
  });

export const data = {
  title: 'Eleventy + Elements + Lit SSR'
};

export function render(data) {
  return /* html */ `
<!DOCTYPE html>
<html lang="en" nve-theme="light" nve-transition="auto">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${process.env.PAGES_BASE_URL}" />
    <title>${data.title}</title>
    <style>
      @import '@nvidia-elements/themes/fonts/inter.css';
      @import '@nvidia-elements/themes/index.css';
      @import '@nvidia-elements/themes/dark.css';
      @import '@nvidia-elements/styles/layout.css';
      @import '@nvidia-elements/styles/responsive.css';
      @import '@nvidia-elements/styles/typography.css';
      @import '@nvidia-elements/styles/view-transitions.css';
    </style>
    <script type="module">
      globalThis.process = { env: { NODE_ENV: '${globalThis.process?.env?.NODE_ENV}' } };
    </script>
    <script type="module">
      import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
      ${stories
        .filter(story => story.entrypoint)
        .map(story => `import '${story.entrypoint}/define.js';`)
        .join('\n')}
    </script>
  </head>
  <body nve-layout="column gap:lg pad:md">
    <h1 nve-text="heading xl">${data.title}${globalThis.process?.env?.NODE_ENV ?? ''}</h1>
    <section nve-layout="grid gap:lg align:vertical-stretch span-items:12 &md|span-items:6 &lg|span-items:4">
      ${stories
        .map(story => {
          return /* html */ `
        <div nve-layout="column gap:md align:stretch pad:md" style="border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)">
          <h2 nve-text="heading lg">${story.name}</h2>
          <div style="max-height: 400px; overflow: hidden;">${story.template}</div>
        </div>`;
        })
        .join('\n')}
    </section>
  </body>
</html>
  `;
}
