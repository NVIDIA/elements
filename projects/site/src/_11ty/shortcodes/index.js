import markdown from '../libraries/markdown.js';

export async function apiShortcode(tag, type, value) {
  return /* html */ `<nve-api-detail tag="${tag}" type="${type}" value="${value}"></nve-api-detail>`;
}

export async function storyShortcode(tag, storyName) {
  const name = tag.replace('nve-', '');
  const storybook = await import(`../../../../elements/dist/${name}/${name}.stories.json`, { with: { type: 'json' } });
  const story = storybook.default.stories.find(s => s.id === storyName);
  return /* html */ `<div><nve-api-canvas source="${markdown.utils.escapeHtml(story.template)}">${story.template}</nve-api-canvas></div>`;
}
