import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { createPlaygroundURLFromStorySource } from '@nve-internals/elements-api';
import { camelToKebab } from '../_11ty/utils/index.js';
import { renderGlobalsScript } from '../_11ty/layouts/common.js';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/'); // eslint-disable-line no-undef

function getStories() {
  return [
    ...globSync(resolve('node_modules/@nvidia-elements/**/dist/**/*.stories.json')),
    ...globSync(resolve('node_modules/@nvidia-elements/**/dist/**/*.stories.json'))
  ].map(path => ({
    path: path.replace(resolve('node_modules/'), '').replace('/dist/', '/').replace('/@nve', '@nve'),
    ...JSON.parse(readFileSync(path, 'utf8'))
  }));
}

const stories = getStories().flatMap(storiesFile => {
  const stories = storiesFile.stories
    // few stories have invalid html so they are filtered out
    .filter(s => !s.template?.includes('${'))
    .filter(s => !s.id.toLowerCase().includes('shadowroot'));

  return stories.map(story => ({
    title: story.id.toLowerCase(),
    permalink: `${storiesFile.path.replace('.stories.json', '-')}${camelToKebab(story.id)}/`,
    template: story.template,
    element: storiesFile.element?.replace('nve-', '')
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
    <title data-pagefind-meta="title">Story - ${data.story.permalink}</title>
    <style>
      @import '/stories/index.css';
    </style>
    <!-- ELEMENT_LOADER_LAZY -->
    ${renderGlobalsScript(data)}
    <script type="module">
      import '/stories/index.ts';
    </script>
  </head>
  <body data-pagefind-ignore="all">
    <div id="iframe-links" nve-layout="row gap:sm align:right" hidden>
      <a href="stories/" nve-text="link body sm">view all</a>
      <a href="${createPlaygroundURLFromStorySource(data.story.template, { id: data.story.title, globals: {} })}" target="_blank" nve-text="link body sm">playground &#8599;</a>
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
