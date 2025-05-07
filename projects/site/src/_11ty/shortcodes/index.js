import { resolve } from 'node:path';
import { globSync } from 'glob';
import { readFileSync } from 'node:fs';
import markdownIt from 'markdown-it';
import { createPlaygroundURLFromStorySource } from '@nve-internals/elements-api';
import { MetadataService } from '@nve-internals/metadata';
import { camelToKebab } from '../utils/index.js';
import markdown from '../libraries/markdown.js';

const md = markdownIt();
const metadata = await MetadataService.getMetadata();
const elements = Object.keys(metadata).flatMap(packageName => metadata[packageName].elements ?? []);

export async function apiShortcode(tag, type, value) {
  const element = elements.find(d => d.name === tag);
  return element
    ? /* html */ `
  ${type === 'description' ? md.render(element.manifest.description ?? '') : ''}
  ${type === 'event' ? md.render(`<code>${value}</code>: ` + element.manifest.events?.find(m => m.name === value)?.description) : ''}
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
  let path;
  let iframePath = '';

  if (tag.includes('.stories.json')) {
    path = tag;
    story = (await import(path, { with: { type: 'json' } })).default.stories?.find(s => s.id === storyName);
    iframePath = `stories/${path.replace('.stories.json', '-')}${camelToKebab(storyName)}/`;
  } else {
    const stories = globSync(`${resolve('../elements')}/dist/**/*.stories.json`).map(path =>
      JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
    );
    let name = tag.replace('nve-', '');
    path = `@nvidia-elements/core/${name}/${name}.stories.json`;
    story = stories.find(s => s.element === tag)?.stories?.find(s => s.id === storyName);
    iframePath = `stories/@nvidia-elements/core/${name}/${name}-${camelToKebab(storyName)}/`;
  }

  const playgroundButton = story
    ? /* html */ `<nve-button container="flat" slot="suffix"><a href="${createPlaygroundURLFromStorySource(story.template, { id: storyName, globals: {} })}" target="_blank">Playground</a></nve-button>`
    : '';

  const reload =
    process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && story && !tag.includes('.stories.json') // eslint-disable-line no-undef
      ? /* html */ `
  <script type="module">
    import stories from '${path}' with { type: 'json' };
    const canvas = document.querySelector('nve-api-canvas#${story.id}');
    const story = stories.stories.find(s => s.id === '${story.id}');
    canvas.innerHTML = \`${playgroundButton}\` + story.template;
    canvas.source = story.template ?? '';
  </script>`
      : '';

  return story
    ? /* html */ `
<nve-api-canvas id="${story.id}">
${playgroundButton}
<template>${markdown.utils.escapeHtml(story.template.replace(/\n\n/g, '\n'))}</template>
${
  config.inline
    ? story.template.replace(/\n\n/g, '\n')
    : `<iframe loading="lazy" src="${iframePath}" style="height: ${config.height}; width: 100%; border: none;" />`
}
</nve-api-canvas>${reload}`
    : '';
}
