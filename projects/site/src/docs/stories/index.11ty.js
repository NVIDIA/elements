import { join, resolve } from 'node:path';
import { camelToKebab } from '../../_11ty/utils/index.js';
import { globSync } from 'glob';
import { readFileSync } from 'node:fs';

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
  </head>
  <body nve-layout="column" data-pagefind-ignore="all">
    <div id="iframe-links" hidden>
      <a href="docs/elements/${data.story.element}/" target="_blank" nve-text="link body sm">documentation &#8599;</a>
    </div>
    <div class="story-container" nve-layout="row full align:center" data-element="${data.story.element}">
      ${data.story.template}
    </div>
    <script type="module">
      import '/stories/index.ts';
    </script>
  </body>
</html>
`,
    'html'
  );
}
