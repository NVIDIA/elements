import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '../types.js';
import { elementMetadataToMarkdown } from './utils.js';

describe('elementMetadataToMarkdown', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: {
              tagName: 'nve-button',
              description: 'button description',
              slots: [{ name: 'slot', description: 'slot description' }],
              attributes: [
                { name: 'attribute', description: 'attribute description', type: { text: 'attribute type' } }
              ],
              members: [{ name: 'member', description: 'member description', type: { text: 'member type' } }],
              cssProperties: [
                { name: 'cssProperty', description: 'cssProperty description', type: { text: 'cssProperty type' } }
              ],
              events: [{ name: 'event', description: 'event description' }],
              metadata: {
                entrypoint: '@nvidia-elements/core/button',
                example: '<nve-button>Hello</nve-button>'
              }
            }
          },
          {
            name: 'nve-badge',
            manifest: {
              tagName: 'nve-badge',
              metadata: {
                entrypoint: '@nvidia-elements/core/badge'
              }
            }
          }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create CEM markdown', () => {
    const markdown = elementMetadataToMarkdown(metadata.projects['@nvidia-elements/core'].elements[0].manifest);
    expect(markdown.includes('## nve-button')).toBe(true);
    expect(markdown.includes('button description')).toBe(true);
    expect(markdown.includes('### Example')).toBe(true);
    expect(markdown.includes('<nve-button>Hello</nve-button>')).toBe(true);
    expect(markdown.includes('### Import')).toBe(true);
    expect(markdown.includes('@nvidia-elements/core/button')).toBe(true);
    expect(markdown.includes('### Slots')).toBe(true);
    expect(markdown.includes('| slot | slot description |')).toBe(true);
    expect(markdown.includes('### Attributes')).toBe(true);
    expect(markdown.includes('| attribute | `attribute type` | attribute description |')).toBe(true);
    expect(markdown.includes('### Properties')).toBe(true);
    expect(markdown.includes('| member | `member type` | member description |')).toBe(true);
    expect(markdown.includes('### Events')).toBe(true);
    expect(markdown.includes('| event | event description |')).toBe(true);
    expect(markdown.includes('### CSS Properties')).toBe(true);
    expect(markdown.includes('| cssProperty | cssProperty description |')).toBe(true);
  });

  it('should create CEM markdown with placeholders', () => {
    const markdown = elementMetadataToMarkdown(metadata.projects['@nvidia-elements/core'].elements[1].manifest);
    expect(markdown.includes('## nve-badge')).toBe(true);
    expect(markdown.includes('No example available.')).toBe(true);
    expect(markdown.includes('### Import')).toBe(true);
    expect(markdown.includes('@nvidia-elements/core/badge')).toBe(true);
    expect(markdown.includes('### Slots')).toBe(true);
    expect(markdown.includes('No slots available.')).toBe(true);
    expect(markdown.includes('### Attributes')).toBe(true);
    expect(markdown.includes('No Attributes available.')).toBe(true);
    expect(markdown.includes('### Properties')).toBe(true);
    expect(markdown.includes('No Properties available.')).toBe(true);
    expect(markdown.includes('### Events')).toBe(true);
    expect(markdown.includes('No Custom Events available.')).toBe(true);
    expect(markdown.includes('### CSS Properties')).toBe(true);
    expect(markdown.includes('No CSS Properties available.')).toBe(true);
  });
});
