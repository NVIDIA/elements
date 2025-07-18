// @ts-check
/* eslint-env node */
/* global process */

import { MetadataService, createPlaygroundURL } from '@internals/metadata';
import { renderGlobalsScript } from '../_11ty/layouts/common.js';
import { stories, BASE_URL } from './utils.js';

const metadata = await MetadataService.getMetadata();

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
<html lang="en" nve-theme="dark">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${BASE_URL}" />
    <title data-pagefind-meta="title">Story - ${data.story.permalink}</title>
    <style>
      @import '/stories/index.css';
    </style>
    <!-- ELEMENT_LOADER_LAZY -->
    ${renderGlobalsScript(data)}
    <script type="module">
      import '/stories/index.ts';
    </script>
    <script type="module">
      import stories from '${data.story.path}' with { type: 'json' };
      const container = document.querySelector('#story-container');
      const story = stories.items.find(s => s.id === '${data.story.id}');
      ${process.env.ELEVENTY_RUN_MODE === 'serve' ? 'container.innerHTML = story.template;' : ''}
    </script>
  </head>
  <body data-pagefind-ignore="all">
    <div id="iframe-links" nve-layout="row gap:sm align:right" hidden>
      <a href="${createPlaygroundURL(data.story.template, metadata, { name: `${data.story.path}_${data.story.title}`, theme: '', trustedContent: true })}" target="_blank" nve-text="link body sm">playground &#8599;</a>
      <a href="docs/elements/${data.story.element}/" target="_blank" nve-text="link body sm">documentation &#8599;</a>
    </div>
    <div id="story-container" data-element="${data.story.element}">
      ${data.story.template}
    </div>
  </body>
</html>
`,
    'html'
  );
}
