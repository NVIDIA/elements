// @ts-check

import markdownIt from 'markdown-it';
import { MetadataService, createPlaygroundURL } from '@internals/metadata';
import { stories } from '../../../src/stories/utils.js';

const md = markdownIt();
const metadata = await MetadataService.getMetadata();
const elements = Object.keys(metadata.projects).flatMap(packageName => metadata.projects[packageName].elements ?? []);

export async function installShortcode(tag) {
  const element = elements.find(d => d.name === tag);
  return element
    ? /* html */ `
\`\`\`typescript
import '${element.manifest.metadata.entrypoint}/define.js';
\`\`\`

\`\`\`html
${element.stories.find(s => s.id === 'Default')?.template}
\`\`\`
`
    : '';
}

export async function apiShortcode(tag, type, value) {
  const element = elements.find(d => d.name === tag);
  return element
    ? /* html */ `
  ${type === 'description' ? md.render(element.manifest.description ?? '') : ''}
  ${type === 'event' ? md.render(`\`${value}\`: ` + element.manifest.events?.find(m => m.name === value)?.description) : ''}
  ${type === 'property' ? md.render(element.manifest.members?.find(m => m.name === value)?.description ?? '') : ''}
  ${type === 'slot' ? md.render(element.manifest.slots?.find(m => m.name === value)?.description ?? '') : ''}
  ${type === 'story' ? md.render(element.stories?.find(m => m.id === value)?.description ?? '') : ''}`
        .trim()
        .replaceAll('<p>', '<p nve-text="body relaxed mkd">')
    : '';
}

export async function storyShortcode(tag, storyName, userConfig = { inline: true, height: '95%' }) {
  const config = typeof userConfig === 'string' ? JSON.parse(userConfig) : userConfig;
  let story;

  if (tag.includes('.stories.json')) {
    story = stories.find(s => s.path.includes(tag) && s.id === storyName);
  } else {
    story = stories.find(s => s.tagName === tag && s.id === storyName);
  }

  const playgroundButton = story
    ? /* html */ `<nve-button container="flat" slot="suffix"><a href="${createPlaygroundURL(story.template, { id: `${story.path}_${storyName}`, theme: '' }, metadata)}" target="_blank">Playground</a></nve-button>`
    : '';

  const reload =
    process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && story && !tag.includes('.stories.json') // eslint-disable-line no-undef
      ? /* html */ `
  <script type="module">
    import stories from '${story.path}' with { type: 'json' };
    const canvas = document.querySelector('nvd-canvas#${story.id}');
    const story = stories.stories.find(s => s.id === '${story.id}');
    canvas.innerHTML = \`${playgroundButton}\` + story.template;
    canvas.source = story.template ?? '';
  </script>`
      : '';

  return story
    ? /* html */ `
${story.description ? `<p nve-text="body relaxed">${md.utils.escapeHtml(story.description)}</p>` : ''}
<nvd-canvas id="${tag}:${story.id}">
${playgroundButton}
<template>${md.utils.escapeHtml(story.template.replace(/\n\n/g, '\n'))}</template>
${
  config.inline
    ? story.template.replace(/\n\n/g, '\n')
    : `<iframe loading="lazy" src="stories/${story?.permalink}index.html" style="height: ${config.height}; width: 100%; border: none;" />`
}
</nvd-canvas>${reload}`
    : '';
}
