import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { camelToKebab } from '../_11ty/utils/index.js';

export function getStories() {
  return [
    ...globSync(resolve('node_modules/@nvidia-elements/**/dist/**/*.stories.json')),
    ...globSync(resolve('node_modules/@nvidia-elements/**/dist/**/*.stories.json')),
    ...globSync(resolve('node_modules/@nve-internals/**/dist/**/*.stories.json'))
  ]
    .map(path => ({
      path: path.replace(resolve('node_modules/'), '').replace('/dist/', '/').replace('/@nve', '@nve'),
      ...JSON.parse(readFileSync(path, 'utf8'))
    }))
    .map(storiesFile => {
      const stories = storiesFile.items
        // few stories have invalid html so they are filtered out
        .filter(s => !s.template?.includes('${'))
        .filter(s => !s.id.toLowerCase().includes('shadowroot'));

      return {
        ...storiesFile,
        stories
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/'); // eslint-disable-line no-undef

export const stories = getStories().flatMap(storiesFile => {
  const stories = storiesFile.stories
    // few stories have invalid html so they are filtered out
    .filter(s => !s.template?.includes('${'))
    .filter(s => !s.id.toLowerCase().includes('shadowroot'));

  return stories.map(story => ({
    id: story.id,
    title: camelToKebab(story.id),
    permalink: `${storiesFile.path.replace('.stories.json', '-')}${camelToKebab(story.id)}/`,
    description: story.description,
    template: story.template,
    tagName: storiesFile.element,
    element: storiesFile.element?.replace('nve-', ''),
    path: storiesFile.path
  }));
});
