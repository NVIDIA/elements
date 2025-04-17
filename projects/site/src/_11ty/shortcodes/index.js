import { createPlaygroundURLFromStorySource } from '@nve-internals/elements-api';
import markdown from '../libraries/markdown.js';

export async function apiShortcode(tag, type, value) {
  return /* html */ `<nve-api-detail tag="${tag}" type="${type}" value="${value}"></nve-api-detail>`;
}

export async function storyShortcode(tag, storyName, userConfig = { inline: true, height: '95%' }) {
  const config = typeof userConfig === 'string' ? JSON.parse(userConfig) : userConfig;
  const name = tag.replace('nve-', '');
  const storyModule = await import(`@nvidia-elements/core/${name}/${name}.stories.json`, { with: { type: 'json' } });
  const story = storyModule.default.stories.find(s => s.id === storyName);
  const reload =
    process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && story // eslint-disable-line no-undef
      ? /* html */ `
  <script type="module">
    import stories from '@nvidia-elements/core/${name}/${name}.stories.json' with { type: 'json' };
    const canvas = document.querySelector('nve-api-canvas#${story.id}');
    const story = stories.stories.find(s => s.id === '${story.id}');
    canvas.innerHTML = story.template ?? '';
    canvas.source = story.template ?? '';
  </script>`
      : '';

  return story
    ? /* html */ `
<nve-api-canvas id="${story.id}">
<nve-button container="flat" slot="suffix"><a href="${createPlaygroundURLFromStorySource(story.template, { id: storyName, globals: {} })}" target="_blank">Playground</a></nve-button>
<template>${markdown.utils.escapeHtml(story.template.replace(/\n\n/g, '\n'))}</template>${config.inline ? story.template.replaceAll('\n', '') : `<iframe loading="lazy" src="stories/${tag.replace('nve-', '')}/${story.id.toLowerCase()}.html" style="height: ${config.height}; width: 95%; border: none;" />`}
</nve-api-canvas>${reload}`
    : '';
}
