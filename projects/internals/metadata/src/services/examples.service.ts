import type MiniSearch from 'minisearch';
import type { Example } from '../types.js';
import { createIndex } from '../indexes/examples.js';

export class ExamplesService {
  static #data: Example[] = null;
  static #index: MiniSearch<Example> = null;

  static async getData(): Promise<Example[]> {
    if (!ExamplesService.#data) {
      try {
        ExamplesService.#data = (await import('../../static/examples.json', { with: { type: 'json' } }))
          .default as Example[];
      } catch {
        /* istanbul ignore next -- @preserve */
        ExamplesService.#data = await fetch(
          'https://NVIDIA.github.io/elements/metadata/examples.json'
        ).then(res => res.json());
      }

      ExamplesService.#index = createIndex(ExamplesService.#data);
    }
    return ExamplesService.#data;
  }

  static async search(query: string) {
    const data = await this.getData();
    const results = ExamplesService.#index.search(query) as unknown as Example[];
    return results.map(result => data.find(d => d.id === result.id));
  }
}
