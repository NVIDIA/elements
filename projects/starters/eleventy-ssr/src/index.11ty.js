// @ts-check

import { ExamplesService } from '@nve-internals/tools/examples';
import { MetadataService } from '@nve-internals/metadata';

const metadata = await MetadataService.getMetadata();
const elements = metadata.projects['@nvidia-elements/core'].elements;

const stories = (await ExamplesService.getAll())
  .filter(
    story =>
      story.id.includes('Default') &&
      !story.element.includes('nve-page-loader') &&
      !story.element.includes('nve-app-header')
  )
  .map(story => {
    const element = elements.find(e => e.name === story.element && !e.manifest?.deprecated);
    return element
      ? {
          name: story.element,
          entrypoint: element?.manifest?.metadata?.entrypoint,
          template: story.template
            .replaceAll('<label>', '<label slot="label">')
            .replaceAll('<nve-control-message>', '<nve-control-message slot="messages">')
        }
      : null;
  })
  .filter(story => story !== null);

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
      @import '@nvidia-elements/styles/labs/layout-viewport.css';
      @import '@nvidia-elements/styles/labs/layout-container.css';
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
