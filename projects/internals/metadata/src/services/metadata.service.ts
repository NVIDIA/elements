import type { MetadataSummary } from '../types.js';

export class MetadataService {
  static #metadata = null;

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
}
