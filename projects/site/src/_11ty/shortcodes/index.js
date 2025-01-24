import markdown from '../libraries/markdown.js';
import { createPlaygroundURLFromStorySource } from '@nve-internals/elements-api';
export async function apiShortcode(tag, type, value) {
  return /* html */ `<nve-api-detail tag="${tag}" type="${type}" value="${value}"></nve-api-detail>`;
}

export async function storyShortcode(tag, storyName) {
  const name = tag.replace('nve-', '');
  const storybook = await import(`../../../../elements/dist/${name}/${name}.stories.json`, { with: { type: 'json' } });
  const story = storybook.default.stories.find(s => s.id === storyName);
  return /* html */ `
<nve-api-canvas>
<nve-button container="flat" slot="suffix"><a href="${createPlaygroundURLFromStorySource(story.template, { id: storyName, globals: {} })}" target="_blank">Playground</a></nve-button>
<template>${markdown.utils.escapeHtml(story.template.replace(/\n\n/g, '\n'))}</template>${story.template}
</nve-api-canvas>`;
}
