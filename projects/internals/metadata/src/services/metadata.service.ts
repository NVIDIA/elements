import type { MetadataSummary, MetadataStory } from '../types.js';

export class MetadataService {
  static #metadata = null;
  static #stories = null;

  static async getMetadata(): Promise<MetadataSummary> {
    if (!MetadataService.#metadata) {
      try {
        MetadataService.#metadata = (await import('../../static/index.json', { with: { type: 'json' } })).default;
      } catch {
        /* istanbul ignore next -- @preserve */
        MetadataService.#metadata = fetch(
          'https://NVIDIA.github.io/elements/metadata/index.json'
        ).then(res => res.json());
      }
    }
    return MetadataService.#metadata;
  }

  static async getStories(): Promise<MetadataStory[]> {
    if (!MetadataService.#stories) {
      try {
        MetadataService.#stories = (await import('../../static/stories.json', { with: { type: 'json' } })).default;
      } catch {
        /* istanbul ignore next -- @preserve */
        MetadataService.#stories = fetch(
          'https://NVIDIA.github.io/elements/metadata/stories.json'
        ).then(res => res.json());
      }
    }
    return MetadataService.#stories;
  }
}
