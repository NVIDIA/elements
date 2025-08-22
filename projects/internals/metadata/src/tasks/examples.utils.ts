import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MetadataExample } from '../types.js';

export function getExamples(): MetadataExample[] {
  return [...globSync(resolve('../../../projects/**/dist/**/*.stories.json'))].flatMap(path => {
    const examples = JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
    return examples.items.map(s => ({
      ...s,
      element: examples.element ?? '',
      entrypoint: examples.entrypoint ?? ''
    }));
  });
}
