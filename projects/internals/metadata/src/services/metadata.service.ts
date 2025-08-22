import type { MetadataSummary, MetadataExample } from '../types.js';

export class MetadataService {
  static #metadata = null;
  static #examples = null;

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

  static async getExamples(): Promise<MetadataExample[]> {
    if (!MetadataService.#examples) {
      try {
        MetadataService.#examples = (await import('../../static/examples.json', { with: { type: 'json' } })).default;
      } catch {
        /* istanbul ignore next -- @preserve */
        MetadataService.#examples = fetch(
          'https://NVIDIA.github.io/elements/metadata/examples.json'
        ).then(res => res.json());
      }
    }
    return MetadataService.#examples;
  }
}
