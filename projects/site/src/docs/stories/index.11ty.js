import { join } from 'node:path';
import { MetadataService } from '@internals/metadata';
import { createPlaygroundURLFromStorySource } from '@internals/elements-api';
import { camelToKebab } from '../../_11ty/utils/index.js';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/'); // eslint-disable-line no-undef

const metadata = await MetadataService.getMetadata();
const stories = metadata['@nvidia-elements/core'].elements.flatMap(element => {
  const stories = element.stories
    // few stories have invalid html so they are filtered out
    .filter(s => !s.template?.includes('${'))
    .filter(s => !s.id.toLowerCase().includes('shadowroot'));

  return stories.map(story => ({
    title: story.id.toLowerCase(),
    permalink: `${element.name.replace('nve-', '')}/${camelToKebab(story.id)}`,
    template: story.template,
    element: element.name.replace('nve-', ''),
    playground: createPlaygroundURLFromStorySource(story.template, { id: story.id, globals: { theme: 'dark' } })
  }));
});

export const data = {
  title: 'Stories',
  pagination: {
    data: 'stories',
    size: 1,
    alias: 'story'
  },
  stories,
  permalink: data => `stories/${data.story.permalink}/index.html`
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${BASE_URL}" />
    <style>
      @import '@nvidia-elements/themes/fonts/inter.css';
      @import '@nvidia-elements/themes/index.css';
      @import '@nvidia-elements/themes/dark.css';
      @import '@nvidia-elements/themes/high-contrast.css';
      @import '@nvidia-elements/themes/compact.css';
      @import '@nvidia-elements/themes/debug.css';
      @import '@nvidia-elements/styles/layout.css';
      @import '@nvidia-elements/styles/responsive.css';
      @import '@nvidia-elements/styles/typography.css';
      @import '@nvidia-elements/styles/view-transitions.css';

      *:not(:defined) {
        visibility: hidden;
      }

      #iframe-links {
        position: fixed;
        inset: auto 1rem 1rem auto;
        z-index: 1000;
      }
    </style>
    <script type="module">
      if (window.self === window.top) {
        document.getElementById('iframe-links').hidden = false;
      }
    </script>
  </head>
  <body nve-layout="column">
    <div id="iframe-links" hidden>
      <a href="docs/elements/${data.story.element}/" target="_blank" nve-text="link body sm">documentation &#8599;</a>
      <a href="${data.story.playground}" target="_blank" nve-text="link body sm">playground &#8599;</a>
    </div>
    <div nve-layout="row full align:center">
      ${data.story.template}
    </div>
  </body>
</html>
`,
    'html'
  );
}
