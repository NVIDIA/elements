import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { camelToKebab } from '../_11ty/utils/index.js';

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

  const updated = stories.map(story => ({
    title: camelToKebab(story.id),
    permalink: `${storiesFile.path.replace('.stories.json', '-')}${camelToKebab(story.id)}/`,
    template: story.template,
    element: storiesFile.element?.replace('nve-', '')
  }));

  // group by element name
  const grouped = updated.reduce((acc, story) => {
    acc[story.element] = acc[story.element] || [];
    acc[story.element].push(story);
    return acc;
  }, {});

  return Object.entries(grouped).map(([element, stories]) => ({ element, stories }));
});

export const data = {
  title: 'Stories',
  layout: 'page.11ty.js',
  permalink: '/stories/index.html'
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
<style>
  .stories {
    column-width: 180px;
    column-gap: 20px;
    padding: 0;
    margin: 0;
    width: 100%;
    list-style: none;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }
</style>
<div nve-layout="column gap:lg pad:lg align:stretch full">
  <h1 nve-text="heading xl">${data.title}</h1>
  <ul class="stories">
  ${stories
    .map(
      story => `
    <li nve-layout="column gap:sm pad-bottom:lg">
      <h2 nve-text="heading">${story.element}</h2>
      <ul nve-text="list nav">
        ${story.stories.map(story => `<li><a nve-text="link body sm" href="stories/${story.permalink}">${story.title}</a></li>`).join('')}
      </ul>
    </li>
    `
    )
    .join('')}
  </ul>
</div>
`,
    'html'
  );
}
