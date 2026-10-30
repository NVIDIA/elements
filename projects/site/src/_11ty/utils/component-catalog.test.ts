import { describe, expect, it } from 'vitest';
import { getComponentCatalog } from './component-catalog.js';

describe('getComponentCatalog', () => {
  it('counts documented components once without including undocumented child tags or deprecated APIs', () => {
    const cardDoc = {
      inputPath: './src/docs/elements/card.md',
      url: '/docs/elements/card/',
      data: { tag: 'nve-card', title: 'Card' }
    };
    const docs = [
      cardDoc,
      cardDoc,
      { ...cardDoc, data: { tag: 'nve-old', title: 'Old' } },
      { ...cardDoc, data: { tag: 'nve-missing', title: 'Missing' } },
      {
        inputPath: './src/docs/markdown/index.md',
        url: '/docs/markdown/',
        data: { tag: 'nve-markdown', title: 'Markdown' }
      },
      {
        inputPath: './src/docs/labs/scene.md',
        url: '/docs/labs/scene/',
        data: { tag: 'nve-scene', title: 'Scene' }
      }
    ];
    const elements = [
      { name: 'nve-card', manifest: { description: ' A card. ' } },
      { name: 'nve-card' },
      { name: 'nve-card-content' },
      { name: 'nve-old', manifest: { deprecated: 'Use nve-card.' } },
      { name: 'nve-markdown' },
      { name: 'nve-scene' }
    ];
    expect(getComponentCatalog(elements, docs).map(component => component.tag)).toEqual(['nve-card', 'nve-markdown']);
  });

  it('includes the library sections supported by the component list', () => {
    const sections = ['elements', 'foundations', 'code', 'markdown', 'media', 'monaco', 'viewport'];
    const docs = sections.map(section => ({
      inputPath: `./src/docs/${section}/example.md`,
      url: `/docs/${section}/example/`,
      data: { tag: `nve-${section}`, title: section }
    }));
    expect(
      getComponentCatalog(
        sections.map(section => ({ name: `nve-${section}` })),
        docs
      )
    ).toHaveLength(sections.length);
  });

  it('returns an empty catalog without documented components', () => {
    expect(getComponentCatalog([{ name: 'nve-card-content' }], [])).toEqual([]);
  });
});
