import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Example } from '../types.js';

export function getExamples(): Example[] {
  return [
    ...globSync(resolve('../../../projects/**/dist/**/*.stories.json')),
    ...globSync(resolve('../../../projects/**/dist/**/*.examples.json'))
  ]
    .filter(path => !path.includes('node_modules'))
    .flatMap(path => {
      const examples = JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
      return examples.items.map(s => ({
        ...s,
        element: examples.element ?? '',
        entrypoint: examples.entrypoint ?? ''
      }));
    });
}
