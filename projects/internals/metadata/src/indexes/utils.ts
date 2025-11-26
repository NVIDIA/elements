import type { Example } from '../types.js';

export const stopWords = new Set([
  'example',
  'examples',
  'story',
  'stories',
  'pattern',
  'patterns',
  'properties',
  'usage',
  'element',
  'component',
  'components',
  'available',
  'display',
  'displays',
  'for',
  'how',
  'and',
  'the',
  'from',
  'this'
]);

export function isPublicExample(example: Example) {
  return (
    !example.deprecated &&
    !example.id.toLowerCase().includes('theme') &&
    !example.tags.includes('anti-pattern') &&
    !example.tags.includes('performance') &&
    !example.tags.includes('test-case') &&
    !example.element?.includes('internal') &&
    !example.element?.includes('responsive')
  );
}
