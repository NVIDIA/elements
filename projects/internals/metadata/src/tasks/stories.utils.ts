import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MetadataStory } from '../types.js';

export function getStories(): MetadataStory[] {
  return [...globSync(resolve('../../../projects/**/dist/**/*.stories.json'))].flatMap(path => {
    const stories = JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
    return stories.items.map(s => ({
      id: s.id,
      description: s.description,
      template: s.template,
      element: stories.element ?? '',
      entrypoint: stories.entrypoint ?? ''
    }));
  });
}
