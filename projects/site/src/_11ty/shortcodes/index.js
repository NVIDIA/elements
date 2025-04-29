import { resolve } from 'node:path';
import { globSync } from 'glob';
import { readFileSync } from 'node:fs';
import { createPlaygroundURLFromStorySource } from '@internals/elements-api';
import markdown from '../libraries/markdown.js';
import { camelToKebab } from '../utils/index.js';

export async function apiShortcode(tag, type, value) {
  return /* html */ `<nve-api-detail tag="${tag}" type="${type}" value="${value}"></nve-api-detail>`;
}

const stories = [
  ...globSync(`${resolve('../elements')}/dist/**/*.stories.json`),
  ...globSync(`${resolve('../monaco')}/dist/**/*.stories.json`),
  ...globSync(`${resolve('../labs/code')}/dist/**/*.stories.json`)
].map(path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')));

export async function storyShortcode(tag, storyName, userConfig = { inline: true, height: '95%' }) {
  const config = typeof userConfig === 'string' ? JSON.parse(userConfig) : userConfig;
  const story = stories.find(s => s.element === tag)?.stories?.find(s => s.id === storyName);
  let name = tag.replace('nve-', '');
  let base = '@nvidia-elements/core';
  if (name === 'monaco-editor') {
    base = '@nvidia-elements/monaco';
    name = 'editor';
  } else if (name === 'codeblock') {
    base = '@nvidia-elements/code';
  }

  const reload =
    process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && story // eslint-disable-line no-undef
      ? /* html */ `
  <script type="module">
    import stories from '${base}/${name}/${name}.stories.json' with { type: 'json' };
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
<template>${markdown.utils.escapeHtml(story.template.replace(/\n\n/g, '\n'))}</template>${config.inline ? story.template.replace(/\n\n/g, '\n') : `<iframe loading="lazy" src="stories/${tag.replace('nve-', '')}/${camelToKebab(story.id)}/" style="height: ${config.height}; width: 100%; border: none;" />`}
</nve-api-canvas>${reload}`
    : '';
}
