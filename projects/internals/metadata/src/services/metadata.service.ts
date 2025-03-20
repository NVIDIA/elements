import type { MetadataSummary } from '../types.js';

export class MetadataService {
  static #metadata = null;

  static async getMetadata(): Promise<MetadataSummary> {
    if (!MetadataService.#metadata) {
      MetadataService.#metadata = (await import('../../static/index.json', { with: { type: 'json' } })).default;
    }
    return MetadataService.#metadata;
  }

  static async getMaglevMetadata() {
    return (await import('../../static/elements.json', { with: { type: 'json' } })).default;
  }
}
